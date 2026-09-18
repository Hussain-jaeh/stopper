import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';

const DAILY_ID = 'stopper-daily-reminder';
const MILESTONE_PREFIX = 'stopper-milestone-';
const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365];

const MILESTONE_MESSAGES: Record<number, { title: string; body: string }> = {
  1:   { title: '1 day clean 💪', body: 'The hardest part is behind you. Keep going.' },
  3:   { title: '3 days strong', body: "You've made it through the toughest stretch. You're doing this." },
  7:   { title: '1 week free 🎉', body: "Seven days clean. That's not luck — that's you choosing yourself every single day." },
  14:  { title: '2 weeks clean', body: "Two weeks. Your brain is already rewiring. Keep showing up." },
  30:  { title: '30 days — one month 🏆', body: "A whole month. You've proven to yourself that change is possible." },
  60:  { title: '60 days strong', body: "Two months in. The cravings are getting quieter. You're winning." },
  90:  { title: '90 days clean 🌟', body: "Three months. You've built something real. Keep protecting it." },
  180: { title: '6 months free', body: "Half a year. Most people never get here. You did." },
  365: { title: '1 year clean 🎊', body: "One full year. You are proof that recovery is real. Celebrate today." },
};

// Explicitly request alert + sound so iOS doesn't silently grant
// "Deliver Quietly" (badges only) instead of full banner permissions.
async function ensurePermissions(): Promise<boolean> {
  const { status, canAskAgain } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: false,
    },
  });
  if (status === 'granted') return true;
  if (!canAskAgain) {
    Alert.alert(
      'Notifications blocked',
      'To receive reminders, enable notifications for Stopper in your device Settings.',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ],
    );
  }
  return false;
}

export async function scheduleReminder(): Promise<boolean> {
  const granted = await ensurePermissions();
  if (!granted) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#14B888',
      sound: 'default',
    });
  }

  await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_ID,
      content: {
        title: 'How are you holding up?',
        body: 'Check in with yourself — every day you show up counts.',
        sound: true,
        ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
    });
  } catch {
    return false;
  }

  return true;
}

/**
 * Keep milestone notifications in step with the streak the app is showing.
 *
 * Takes the CURRENT STREAK rather than a timestamp, deliberately. The previous
 * version was handed Date.now() from the one place that called it — the relapse
 * handler — so the schedule was anchored to the moment someone tapped "I
 * slipped", which is unrelated to the streak on the dashboard. The two then
 * drifted, and the app cheerfully announced "3 days strong" to someone whose
 * streak said otherwise. Congratulating a person for a streak they have just
 * broken is the worst thing this app can do.
 *
 * Deriving day 0 from the displayed streak means the two cannot disagree: the
 * streak is counted in calendar days (daysBetween floors to startOfDay), so
 * day 0 is simply local midnight, `streak` days ago.
 *
 * Calendar arithmetic via setDate, not 24-hour blocks — otherwise every DST
 * change shifts the whole schedule by an hour and eventually across midnight.
 */
export async function syncMilestoneNotifications(currentStreak: number): Promise<void> {
  await cancelMilestoneNotifications();

  const granted = await ensurePermissions();
  if (!granted) return;

  const day0 = new Date();
  day0.setHours(0, 0, 0, 0);
  day0.setDate(day0.getDate() - Math.max(0, currentStreak));

  const now = Date.now();

  for (const day of MILESTONES) {
    const fireDate = new Date(day0);
    fireDate.setDate(day0.getDate() + day);
    fireDate.setHours(10, 0, 0, 0);
    if (fireDate.getTime() <= now) continue;

    const msg = MILESTONE_MESSAGES[day];
    await Notifications.scheduleNotificationAsync({
      identifier: `${MILESTONE_PREFIX}${day}`,
      content: { title: msg.title, body: msg.body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    }).catch(() => {});
  }
}

/**
 * Same thing for a user with no relapse history yet — converts a quit date to
 * a streak using the calendar-day rule the backend uses, then delegates, so
 * there is still only one scheduling path.
 */
export async function syncMilestonesFromQuitDate(quitDateMs: number): Promise<void> {
  const start = new Date(quitDateMs); start.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.round((today.getTime() - start.getTime()) / 86_400_000));
  await syncMilestoneNotifications(days);
}

export async function sendTestNotification(): Promise<boolean> {
  const granted = await ensurePermissions();
  if (!granted) return false;
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: 'stopper-test',
      content: {
        title: '🔔 Test notification',
        body: 'Notifications are working!',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelMilestoneNotifications(): Promise<void> {
  await Promise.all(
    MILESTONES.map(day =>
      Notifications.cancelScheduledNotificationAsync(`${MILESTONE_PREFIX}${day}`).catch(() => {}),
    ),
  );
}

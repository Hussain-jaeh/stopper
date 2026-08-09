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

async function ensurePermissions(): Promise<boolean> {
  const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
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
  } catch (e) {
    console.warn('[notifications] scheduleReminder failed', e);
    return false;
  }

  return true;
}

export async function cancelReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});
}

/**
 * Schedule milestone notifications based on the user's quit date.
 * Call this after onboarding completes and after any relapse (with the new quit date).
 * Safe to call multiple times — cancels old milestone notifications first.
 */
export async function scheduleMilestoneNotifications(quitDateMs: number): Promise<void> {
  // Cancel any existing milestone notifications
  await cancelMilestoneNotifications();

  const granted = await ensurePermissions();
  if (!granted) return;

  const now = Date.now();

  for (const day of MILESTONES) {
    const fireMs = quitDateMs + day * 24 * 60 * 60 * 1000;
    if (fireMs <= now) continue; // milestone already passed

    const msg = MILESTONE_MESSAGES[day];
    const fireDate = new Date(fireMs);
    // Fire at 10 AM on the milestone day
    fireDate.setHours(10, 0, 0, 0);
    if (fireDate.getTime() <= now) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `${MILESTONE_PREFIX}${day}`,
      content: {
        title: msg.title,
        body: msg.body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    }).catch(e => console.warn(`[notifications] milestone ${day}d scheduling failed`, e));
  }
}

export async function cancelMilestoneNotifications(): Promise<void> {
  await Promise.all(
    MILESTONES.map(day =>
      Notifications.cancelScheduledNotificationAsync(`${MILESTONE_PREFIX}${day}`).catch(() => {}),
    ),
  );
}

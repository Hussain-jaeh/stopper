import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';

const IDENTIFIER = 'stopper-daily-reminder';

// 9:00 AM daily — the notification the user asked for.
const HOUR = 9;
const MINUTE = 0;

/**
 * Requests notification permissions then schedules (or re-schedules) a daily
 * 9 AM reminder. Returns true if the reminder was successfully scheduled,
 * false if the user denied permissions (so the caller can revert the toggle).
 */
export async function scheduleReminder(): Promise<boolean> {
  const { status, canAskAgain } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    if (!canAskAgain) {
      Alert.alert(
        'Notifications blocked',
        'To receive daily reminders, enable notifications for Stopper in your device Settings.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
    }
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#14B888',
      sound: 'default',
    });
  }

  // Cancel any existing one first so we never double-schedule.
  await Notifications.cancelScheduledNotificationAsync(IDENTIFIER).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: IDENTIFIER,
    content: {
      title: 'How are you holding up?',
      body: 'Check in with yourself — every day you show up counts.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: HOUR,
      minute: MINUTE,
    },
  });

  return true;
}

export async function cancelReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(IDENTIFIER).catch(() => {});
}

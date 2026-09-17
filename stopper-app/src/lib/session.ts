import * as SecureStore from 'expo-secure-store';
import { SUB_CACHE_KEY } from './purchases';

/**
 * Records that the user deliberately ended their session — signing out from
 * Profile, or leaving via the paywall's close button. Without it, first launch
 * and "signed out five seconds ago" look identical, and auto-creating a guest
 * on both would make the sign-in screen impossible to reach.
 */
const AUTH_INTENT_KEY = 'auth_intent';

export async function markManualSignOut(): Promise<void> {
  await SecureStore.setItemAsync(AUTH_INTENT_KEY, 'manual').catch(() => {});
}

/**
 * True only for someone who has never run Stopper on this device.
 *
 * The auth-intent key is the direct signal, but it did not exist before this
 * release — so anyone already installed would look "new" and get silently
 * turned into a guest, stranding the account they already have. The
 * subscription cache is written on every launch that reaches the paywall
 * check, which makes its presence reliable evidence of a prior install.
 *
 * Errs toward false: if SecureStore is unreadable we show the auth screen,
 * which is recoverable, rather than minting a guest over an existing account.
 */
export async function isFirstEverLaunch(): Promise<boolean> {
  try {
    const [intent, subCache] = await Promise.all([
      SecureStore.getItemAsync(AUTH_INTENT_KEY),
      SecureStore.getItemAsync(SUB_CACHE_KEY),
    ]);
    return intent === null && subCache === null;
  } catch {
    return false;
  }
}

/**
 * Makes this device look untouched, so the next launch takes the first-ever
 * path: guest session, straight into onboarding, no auth screen.
 *
 * This exists because the iOS keychain survives app deletion — reinstalling
 * does NOT reset these keys, which makes the new-user flow the one path in
 * the app you cannot test by reinstalling. DEV ONLY; the caller guards on
 * __DEV__ so it can't ship.
 */
export async function resetFirstLaunchState(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_INTENT_KEY).catch(() => {}),
    SecureStore.deleteItemAsync(SUB_CACHE_KEY).catch(() => {}),
  ]);
}

/** Clears the manual-sign-out marker once the user is signed in again. */
export async function clearAuthIntent(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_INTENT_KEY).catch(() => {});
}

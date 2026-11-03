import Purchases, { LOG_LEVEL, PACKAGE_TYPE as PackageType, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

const RC_IOS_KEY = 'appl_CxdiKAfrMSKPunCqwXIwBXDsTgr';

/**
 * Cached entitlement flag, so a returning subscriber isn't held at a spinner
 * while RevenueCat answers. Must be cleared on sign-out — otherwise the next
 * account to sign in on this device inherits it and skips the paywall.
 */
export const SUB_CACHE_KEY = 'rc_has_sub';

export function initPurchases() {
  if (Platform.OS !== 'ios') return;
  Purchases.configure({ apiKey: RC_IOS_KEY });
}

export type RCPlan = {
  pkg: PurchasesPackage;
  id: string;
  label: string;
  priceString: string;
  subLabel: string;
  best: boolean;
  badge?: string;
};

const TYPE_META: Record<string, { label: string; best: boolean; badge?: string }> = {
  [PackageType.WEEKLY]:  { label: 'Weekly',  best: false },
  [PackageType.MONTHLY]: { label: 'Monthly', best: false },
  // $24.99/yr vs $3.99 × 12 = $47.88 → ~48% off.
  [PackageType.ANNUAL]:  { label: 'Yearly',  best: true, badge: 'Save 48%' },
};

export function mapPackages(pkgs: PurchasesPackage[]): RCPlan[] {
  // Weekly is dropped from the paywall: at $6.99/wk it cost more than monthly
  // and made the $3.99 plan look like a trick. Existing weekly subscribers keep it.
  const ORDER = [PackageType.ANNUAL, PackageType.MONTHLY];
  const sorted = pkgs.filter(p => ORDER.includes(p.packageType as any)).sort(
    (a, b) => ORDER.indexOf(a.packageType as any) - ORDER.indexOf(b.packageType as any),
  );

  // The yearly badge is computed from the store's real prices, so it stays
  // true whatever the yearly plan is priced at in App Store Connect.
  const monthly = sorted.find(p => p.packageType === PackageType.MONTHLY)?.product.price;
  const annual = sorted.find(p => p.packageType === PackageType.ANNUAL)?.product.price;
  const savePct = monthly && annual ? Math.round((1 - annual / (monthly * 12)) * 100) : 0;

  return sorted.map(pkg => {
    const base = TYPE_META[pkg.packageType] ?? { label: pkg.identifier, best: false };
    const meta = pkg.packageType === PackageType.ANNUAL
      ? { ...base, badge: savePct >= 5 ? `Save ${savePct}%` : undefined }
      : base;
    const priceString = pkg.product.priceString;

    return {
      pkg,
      id: pkg.identifier,
      label: meta.label,
      priceString,
      subLabel: pkg.packageType === PackageType.ANNUAL
        ? (pkg.product.pricePerMonthString
            ? `${priceString} billed yearly · ${pkg.product.pricePerMonthString}/mo`
            : `${priceString} billed yearly`)
        : `${priceString} billed ${meta.label.toLowerCase()}`,
      best: meta.best,
      badge: meta.badge,
    };
  });
}

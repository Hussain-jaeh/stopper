import Purchases, { LOG_LEVEL, PACKAGE_TYPE as PackageType, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

export function initPurchases() {
  if (Platform.OS !== 'ios') return;
  Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_RC_IOS_KEY! });
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
  [PackageType.MONTHLY]: { label: 'Monthly', best: true, badge: 'Best value' },
};

export function mapPackages(pkgs: PurchasesPackage[]): RCPlan[] {
  const ORDER = [PackageType.WEEKLY, PackageType.MONTHLY];
  const sorted = [...pkgs].sort(
    (a, b) => ORDER.indexOf(a.packageType as any) - ORDER.indexOf(b.packageType as any),
  );

  return sorted.map(pkg => {
    const meta = TYPE_META[pkg.packageType] ?? { label: pkg.identifier, best: false };
    const priceString = pkg.product.priceString;

    return {
      pkg,
      id: pkg.identifier,
      label: meta.label,
      priceString,
      subLabel: `${priceString} billed ${meta.label.toLowerCase()}`,
      best: meta.best,
      badge: meta.badge,
    };
  });
}

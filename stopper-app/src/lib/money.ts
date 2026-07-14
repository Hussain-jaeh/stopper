export type SpendingFrequency = 'daily' | 'weekly' | 'monthly';

export type SpendingSettings = {
  spendingAmount: number;
  spendingFrequency: SpendingFrequency;
  currency: string;
  trackingEnabled: boolean;
};

export const CURRENCIES = [
  { code: 'NGN', sym: '₦', locale: 'en-NG' },
  { code: 'USD', sym: '$', locale: 'en-US' },
  { code: 'GBP', sym: '£', locale: 'en-GB' },
  { code: 'EUR', sym: '€', locale: 'de-DE' },
];

export function perDay(amount: number, freq: SpendingFrequency): number {
  return freq === 'daily' ? amount : freq === 'weekly' ? amount / 7 : amount / 30;
}

export function savedTotal(s: SpendingSettings, daysSinceQuit: number): number {
  return perDay(s.spendingAmount, s.spendingFrequency) * Math.max(0, daysSinceQuit);
}

export function savedBuckets(s: SpendingSettings, daysSinceQuit: number) {
  const pd = perDay(s.spendingAmount, s.spendingFrequency);
  return {
    today: pd,
    week: pd * Math.min(7, daysSinceQuit),
    month: pd * Math.min(30, daysSinceQuit),
    total: pd * daysSinceQuit,
  };
}

export function projection(s: SpendingSettings) {
  const pd = perDay(s.spendingAmount, s.spendingFrequency);
  return { in30: pd * 30, in6mo: pd * 182, in1yr: pd * 365 };
}

export function fmtMoney(n: number, currency: string): string {
  try {
    const loc = CURRENCIES.find(c => c.code === currency)?.locale;
    return new Intl.NumberFormat(loc, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.round(n));
  } catch {
    const sym = CURRENCIES.find(c => c.code === currency)?.sym ?? '';
    return sym + Math.round(n).toLocaleString();
  }
}

export function buildMoneyMilestones(currency: string): { threshold: number }[] {
  const big = currency === 'NGN' || currency === 'KES' || currency === 'JPY';
  const steps = big ? [10000, 50000, 100000, 250000, 500000, 1000000] : [100, 500, 1000, 2500, 5000];
  return steps.map(threshold => ({ threshold }));
}

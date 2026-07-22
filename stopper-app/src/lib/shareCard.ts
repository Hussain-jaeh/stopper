// Composes share-card copy from user data + a per-share privacy choice.
// The rendered image itself is produced natively (react-native-view-shot) from
// a <ShareCardView> laid out to STORY (1080×1920) or SQUARE (1080×1080).
export type ShareCardType = 'streak' | 'money' | 'stats' | 'win';
export type ShareFormat = 'story' | 'square';

export type ShareData = {
  days: number;
  longest: number;
  money: string;      // pre-formatted, e.g. "₦45,000"
  cleanPct: number;
  resisted: number;
  habit: string;      // e.g. "vape" — only revealed if showHabit
};

export function cardContent(type: ShareCardType, d: ShareData, showHabit: boolean) {
  const suffix = showHabit ? `${d.habit}-free` : 'free';
  if (type === 'streak') return {
    kicker: 'MY STREAK', big: String(d.days), unit: `days ${suffix}`,
    sub: `Longest yet: ${d.longest} days`, glyph: '🔥',
  };
  if (type === 'money') return {
    kicker: 'MONEY KEPT', big: d.money, unit: `saved in ${d.days} days`,
    sub: showHabit ? `Since I quit ${d.habit}` : 'Since I started my journey', glyph: '💰',
  };
  if (type === 'stats') return {
    kicker: 'MY PROGRESS', big: `Day ${d.days}`, unit: suffix,
    sub: `${d.cleanPct}% clean days · ${d.resisted} cravings beaten`, glyph: '🌱',
  };
  // win — photo card, text overlay only
  return {
    kicker: 'MY WIN', big: String(d.days), unit: 'days free',
    sub: showHabit ? `${d.days} days ${d.habit}-free` : `${d.days} days and going strong`, glyph: '💪',
  };
}

export const FORMAT_SIZE: Record<ShareFormat, { w: number; h: number }> = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
};

// Milestone thresholds that auto-trigger the celebration screen.
export const SHARE_MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365];
export function isShareMilestone(days: number) { return SHARE_MILESTONES.includes(days); }

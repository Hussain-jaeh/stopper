export const OVERCOME = [
  { id: 'porn', label: 'Pornography', tint: '#7B4FD4' },
  { id: 'social', label: 'Social media', tint: '#2E7DD1' },
  { id: 'smoking', label: 'Smoking / vaping', tint: '#E0581F' },
  { id: 'alcohol', label: 'Alcohol', tint: '#C2410C' },
  { id: 'drugs', label: 'Drugs', tint: '#0F9468' },
  { id: 'gaming', label: 'Gaming', tint: '#9B6FE4' },
  { id: 'procrast', label: 'Procrastination', tint: '#2BB6C4' },
  { id: 'eating', label: 'Unhealthy eating', tint: '#F2B23E' },
  { id: 'other', label: 'Something else', tint: '#5A5A5A' },
] as const;

export const OVERCOME_ICON_NAMES: Record<string, string> = {
  porn: 'eye-off',
  social: 'smartphone',
  smoking: 'cigarette',
  alcohol: 'wine',
  drugs: 'pill',
  gaming: 'gamepad-2',
  procrast: 'hourglass',
  eating: 'cookie',
  other: 'plus',
};

export const REASONS = [
  { id: 'focus', label: 'Improve focus' },
  { id: 'health', label: 'Improve health' },
  { id: 'relationships', label: 'Better relationships' },
  { id: 'faith', label: 'Religious / spiritual reasons' },
  { id: 'career', label: 'Career growth' },
  { id: 'discipline', label: 'Personal discipline' },
  { id: 'other', label: 'Other' },
] as const;

export const REASON_ICON_NAMES: Record<string, string> = {
  focus: 'target',
  health: 'heart-pulse',
  relationships: 'users',
  faith: 'sparkle',
  career: 'trending-up',
  discipline: 'shield',
  other: 'plus',
};

export const DURATIONS = [
  'Less than 6 months',
  '6–12 months',
  '1–3 years',
  '3–5 years',
  'More than 5 years',
] as const;

export const FREQS = [
  'Multiple times a day',
  'About once a day',
  'A few times a week',
  'Once a week or less',
] as const;

export const TRIGGERS = [
  { id: 'stress', label: 'Stress' },
  { id: 'boredom', label: 'Boredom' },
  { id: 'loneliness', label: 'Loneliness' },
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'social', label: 'Social situations' },
  { id: 'latenights', label: 'Late nights' },
  { id: 'other', label: 'Other' },
] as const;

export const TRIGGER_ICON_NAMES: Record<string, string> = {
  stress: 'zap',
  boredom: 'cloud',
  loneliness: 'user',
  anxiety: 'wind',
  social: 'users',
  latenights: 'moon',
  other: 'plus',
};

export const GOALS = [
  { id: 'selfcontrol', label: 'Stronger self-control', color: '#2E7DD1' },
  { id: 'relationships', label: 'Deeper relationships', color: '#FF6B4A' },
  { id: 'mood', label: 'Better mood & happiness', color: '#F2B23E' },
  { id: 'energy', label: 'More energy & drive', color: '#E0581F' },
  { id: 'focus', label: 'Sharper focus & clarity', color: '#9B6FE4' },
  { id: 'confidence', label: 'Real confidence', color: '#14B888' },
] as const;

export const GOAL_ICON_NAMES: Record<string, string> = {
  selfcontrol: 'brain',
  relationships: 'heart',
  mood: 'smile',
  energy: 'zap',
  focus: 'target',
  confidence: 'sparkles',
};

export const TIMES = [
  { id: 'morning', label: 'Morning', sub: 'Start the day with intention' },
  { id: 'midday', label: 'Midday', sub: 'A reset in the middle of the day' },
  { id: 'evening', label: 'Evening', sub: 'Reflect before bed' },
] as const;

export const TIME_ICON_NAMES: Record<string, string> = {
  morning: 'sunrise',
  midday: 'sun',
  evening: 'moon',
};

export const ACTIVITIES = [
  { id: 'walking', label: 'Walking' },
  { id: 'running', label: 'Running' },
  { id: 'gym', label: 'Gym' },
  { id: 'pushups', label: 'Pushups' },
  { id: 'home', label: 'Home workouts' },
  { id: 'none', label: 'None for now' },
] as const;

export const ACTIVITY_ICON_NAMES: Record<string, string> = {
  walking: 'footprints',
  running: 'activity',
  gym: 'dumbbell',
  pushups: 'arrow-up',
  home: 'house',
  none: 'circle-slash',
};

export const ACCOUNT = [
  { id: 'ai', title: 'AI Coach', sub: 'Private, 24/7 guidance that learns your patterns' },
  { id: 'friend', title: 'A friend', sub: 'Invite someone you trust to keep you honest' },
  { id: 'community', title: 'Community', sub: 'Recover alongside thousands on the same path' },
  { id: 'private', title: 'Private journey', sub: 'Just you and your progress — no sharing' },
] as const;

export const ACCOUNT_ICON_NAMES: Record<string, string> = {
  ai: 'bot',
  friend: 'user-plus',
  community: 'users',
  private: 'lock',
};

export const SYMPTOMS = {
  Mental: [
    { label: 'Lack of ambition to pursue goals', boldWord: 'Lack of ambition', id: 'm0' },
    { label: "Poor memory or 'brain fog'", boldWord: 'Poor memory', id: 'm1' },
    { label: 'Difficulty concentrating', boldWord: 'concentrating', id: 'm2' },
    { label: 'General anxiety', boldWord: 'anxiety', id: 'm3' },
    { label: 'Feeling unmotivated', boldWord: 'unmotivated', id: 'm4' },
  ],
  Physical: [
    { label: 'Low energy through the day', boldWord: 'Low energy', id: 'p0' },
    { label: 'Disrupted sleep', boldWord: 'sleep', id: 'p1' },
  ],
};

export const AGES = ['Under 18', '18–24', '25–34', '35–44', '45+'] as const;

export const OVERCOME_LABELS: Record<string, string> = {
  porn: 'porn',
  social: 'social media',
  smoking: 'smoking',
  alcohol: 'alcohol',
  drugs: 'drugs',
  gaming: 'gaming',
  procrast: 'procrastination',
  eating: 'unhealthy eating',
  other: 'this habit',
};

export type OvercomeId = typeof OVERCOME[number]['id'];
export type ReasonId = typeof REASONS[number]['id'];
export type TriggerId = typeof TRIGGERS[number]['id'];
export type GoalId = typeof GOALS[number]['id'];
export type ActivityId = typeof ACTIVITIES[number]['id'];
export type AccountId = typeof ACCOUNT[number]['id'];
export type TimeId = typeof TIMES[number]['id'];
export type DurationValue = typeof DURATIONS[number];
export type FreqValue = typeof FREQS[number];

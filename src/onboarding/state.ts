import type {
  OvercomeId, ReasonId, TriggerId, GoalId,
  ActivityId, AccountId, TimeId, DurationValue, FreqValue
} from './data';

export interface OnboardingState {
  overcome: Set<OvercomeId>;
  reasons: Set<ReasonId>;
  duration: DurationValue | '';
  freq: FreqValue | '';
  triggers: Set<TriggerId>;
  goals: Set<GoalId>;
  committed: boolean;
  checkin: TimeId | '';
  activities: Set<ActivityId>;
  account: AccountId | '';
  symptoms: Set<string>;
  name: string;
  age: string;
}

export function freshState(): OnboardingState {
  return {
    overcome: new Set(),
    reasons: new Set(),
    duration: '',
    freq: '',
    triggers: new Set(),
    goals: new Set(),
    committed: false,
    checkin: '',
    activities: new Set(),
    account: '',
    symptoms: new Set(),
    name: '',
    age: '',
  };
}

export function habitLabel(state: OnboardingState): string {
  const first = [...state.overcome][0];
  const labels: Record<string, string> = {
    porn: 'porn', social: 'social media', smoking: 'smoking',
    alcohol: 'alcohol', drugs: 'drugs', gaming: 'gaming',
    procrast: 'procrastination', eating: 'unhealthy eating', other: 'this habit',
  };
  return first ? (labels[first] || 'this habit') : 'this habit';
}

export function primaryHabit(state: OnboardingState): string {
  const first = [...state.overcome][0];
  const labels: Record<string, string> = {
    porn: 'porn', social: 'social media', smoking: 'smoking',
    alcohol: 'alcohol', drugs: 'drugs', gaming: 'gaming',
    procrast: 'procrastination', eating: 'unhealthy eating', other: 'your habit',
  };
  return first ? (labels[first] || 'your habit') : 'your habit';
}

export function firstName(state: OnboardingState): string {
  return (state.name || '').trim().split(' ')[0];
}

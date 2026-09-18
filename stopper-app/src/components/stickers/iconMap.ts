// components/stickers/iconMap.ts
//
// THE FULL STICKER INVENTORY — every icon in the app apart from the flame.
// One entry per sticker: a Lucide glyph name + its assigned tone.
//
// `lucide-react-native` exports every name below in PascalCase, e.g.
// Lucide 'heart-pulse' → import { HeartPulse } from 'lucide-react-native'.
// GLYPHS maps our semantic key → the component, so screens never hardcode a glyph.
//
// Verified against lucide-react-native@1.17.0 (the version in package.json).

import {
  // dashboard + core
  Trophy, PiggyBank, Target, Check, Sprout, Quote, RefreshCw, CircleCheckBig, Activity, RotateCcw, Flame,
  // navigation / tab bar
  House, ChartLine, LifeBuoy, Users, User,
  // onboarding — habits
  EyeOff, Smartphone, Cigarette, Wine, Pill, Gamepad2, Hourglass, Cookie, Dice5, Infinity as InfinityIcon, Plus,
  // onboarding — reasons
  HeartPulse, TrendingUp, Anchor, Crosshair, Compass, HeartHandshake, Sparkles,
  // onboarding — triggers
  Gauge, Meh, PersonStanding, CloudLightning, PartyPopper, Moon,
  // onboarding — goals
  Brain, Heart, Smile, Zap,
  // onboarding — education
  BrainCircuit, BatteryLow, HeartCrack,
  // onboarding — check-in times
  Sunrise, Sun,
  // onboarding — activity
  Footprints, SportShoe, Dumbbell, Repeat, CircleSlash,
  // onboarding — accountability
  Bot, UserPlus, MessagesSquare, Lock,
  // panic / craving
  Wind as Breathe, WavesHorizontal, PhoneCall,
  // milestones
  Flag, CalendarCheck, Award, Medal, Crown, Gem,
  // money
  Coins, Lightbulb,
  // vault / share
  Video, Play, Share2, Download, Link as LinkIcon, Bell,
  type LucideIcon,
} from 'lucide-react-native';

import type { StickerTone } from './stickerTokens';

export type StickerKey = keyof typeof GLYPHS;

/** semantic key → [glyph, default tone] */
export const GLYPHS = {
  /* ── Dashboard ─────────────────────────────────────────── */
  // The handoff left this out because the ANIMATED FlameSticker owns the hero
  // treatment. A static disc at tile size needs none of that, and leaving it
  // out was the only thing keeping the summary row off the sticker system.
  streakFlame:    [Flame, 'coral'],
  bestStreak:     [Trophy, 'gold'],
  moneySaved:     [PiggyBank, 'gold'],
  successRate:    [Target, 'jade'],        // sole owner of Target now
  checkInDone:    [Check, 'jade'],
  checkIn:        [CircleCheckBig, 'jade'],
  growth:         [Sprout, 'jade'],
  motivation:     [Quote, 'jade'],
  retry:          [RefreshCw, 'slate'],
  cravingAvg:     [Activity, 'coral'],
  // Slate, not coral: the relapse count sits on the dashboard every day, and a
  // bright warning disc next to it reads as a telling-off rather than a stat.
  relapseCount:   [RotateCcw, 'slate'],

  /* ── Tab bar ───────────────────────────────────────────── */
  tabHome:        [House, 'jade'],
  tabProgress:    [ChartLine, 'jade'],
  tabPanic:       [LifeBuoy, 'coral'],
  tabCommunity:   [Users, 'blue'],         // sole owner of Users now
  tabProfile:     [User, 'slate'],         // sole owner of User now

  /* ── Onboarding · what to overcome ─────────────────────── */
  habitPorn:      [EyeOff, 'violet'],
  habitSocial:    [Smartphone, 'blue'],
  habitSmoking:   [Cigarette, 'coral'],
  habitAlcohol:   [Wine, 'coral'],
  habitDrugs:     [Pill, 'coral'],         // was jade — jade is the success tone
  habitGaming:    [Gamepad2, 'violet'],
  habitProcrast:  [Hourglass, 'violet'],
  habitEating:    [Cookie, 'coral'],       // was gold — gold is the reward tone
  habitGambling:  [Dice5, 'violet'],
  habitScrolling: [InfinityIcon, 'violet'],
  habitOther:     [Plus, 'slate'],

  /* ── Onboarding · why are you starting ─────────────────── */
  whyFocus:       [Crosshair, 'violet'],   // was Target
  whyHealth:      [HeartPulse, 'coral'],
  whyRelations:   [HeartHandshake, 'blue'],// was Users
  whyFaith:       [Compass, 'violet'],     // was Sparkle/gold — violet is the spirituality tone
  whyCareer:      [TrendingUp, 'jade'],
  whyDiscipline:  [Anchor, 'jade'],        // was Shield — Shield is the app's own brand mark

  /* ── Onboarding · triggers ─────────────────────────────── */
  trigStress:     [Gauge, 'coral'],        // was Zap/gold
  trigBoredom:    [Meh, 'slate'],          // was Cloud
  trigLonely:     [PersonStanding, 'blue'],// was User
  trigAnxiety:    [CloudLightning, 'blue'],// was Wind
  trigSocial:     [PartyPopper, 'blue'],   // was Users
  trigLateNight:  [Moon, 'blue'],

  /* ── Onboarding · goals ────────────────────────────────── */
  goalSelfControl:[Brain, 'blue'],
  goalRelations:  [Heart, 'coral'],
  goalMood:       [Smile, 'gold'],
  goalEnergy:     [Zap, 'coral'],          // sole owner of Zap now
  goalFocus:      [Crosshair, 'violet'],   // was Target
  goalConfidence: [Sparkles, 'jade'],

  /* ── Onboarding · education carousel ───────────────────── */
  eduHijack:      [BrainCircuit, 'violet'],// was Brain
  eduDrained:     [BatteryLow, 'blue'],
  eduCosts:       [HeartCrack, 'coral'],
  eduReset:       [Sprout, 'jade'],

  /* ── Onboarding · check-in time ────────────────────────── */
  timeMorning:    [Sunrise, 'gold'],       // sole owner of Sunrise now
  timeMidday:     [Sun, 'gold'],
  timeEvening:    [Moon, 'blue'],

  /* ── Onboarding · physical activity ────────────────────── */
  actWalking:     [Footprints, 'jade'],
  actRunning:     [SportShoe, 'jade'],     // was Activity (reads as a heart-rate line)
  actGym:         [Dumbbell, 'blue'],
  actPushups:     [Repeat, 'blue'],        // was ArrowDownUp (the sort glyph)
  actHome:        [House, 'jade'],
  actNone:        [CircleSlash, 'slate'],

  /* ── Onboarding · accountability ───────────────────────── */
  accCoach:       [Bot, 'jade'],
  accFriend:      [UserPlus, 'coral'],
  accCommunity:   [MessagesSquare, 'blue'],// was Users
  accPrivate:     [Lock, 'slate'],

  /* ── Panic / craving flow ──────────────────────────────── */
  panicBreathe:   [Breathe, 'coral'],      // sole owner of Wind now
  panicWave:      [WavesHorizontal, 'blue'],// `Waves` no longer exists in lucide 1.x
  panicCall:      [PhoneCall, 'jade'],

  /* ── Milestones (use diecut) ───────────────────────────── */
  mile01:         [Flag, 'gold'],          // was Sunrise
  mile07:         [CalendarCheck, 'jade'],
  mile14:         [Award, 'gold'],         // was Zap
  mile30:         [Medal, 'gold'],
  mile90:         [Trophy, 'gold'],
  mile180:        [Crown, 'violet'],
  mile365:        [Gem, 'blue'],

  /* ── Money ─────────────────────────────────────────────── */
  moneyCoins:     [Coins, 'gold'],
  moneyInsight:   [Lightbulb, 'jade'],

  /* ── Vault / share ─────────────────────────────────────── */
  vaultRecord:    [Video, 'coral'],
  vaultPlay:      [Play, 'jade'],
  share:          [Share2, 'jade'],
  saveImage:      [Download, 'blue'],
  copyLink:       [LinkIcon, 'blue'],
  notify:         [Bell, 'gold'],

  /* ── Locked state (handled by Sticker, listed for completeness) */
  locked:         [Lock, 'slate'],
} satisfies Record<string, [LucideIcon, StickerTone]>;

export function glyphFor(key: StickerKey): LucideIcon { return GLYPHS[key][0]; }
export function toneFor(key: StickerKey): StickerTone { return GLYPHS[key][1] as StickerTone; }

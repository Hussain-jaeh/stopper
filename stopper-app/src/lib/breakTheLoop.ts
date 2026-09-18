// lib/breakTheLoop.ts
// Stroop trial generation + constants. Pure logic, no UI.
//
// ANTI-GAME: this module deliberately exposes NO score, streak, accuracy or
// attempt count. If a future ticket asks for one, push back — see README.

export type InkId = 'red' | 'blue' | 'green' | 'yellow';

export type Ink = { id: InkId; hex: string; word: string };

/** The four answer colours. Saturated and mutually unmistakable — the one
 *  documented exception to Stopper's calm palette. The task collapses if
 *  any two read alike, so do NOT retune these toward the brand. */
export const INKS: Ink[] = [
  { id: 'red',    hex: '#FF5A4A', word: 'RED' },
  { id: 'blue',   hex: '#4A9CFF', word: 'BLUE' },
  { id: 'green',  hex: '#2DD4A0', word: 'GREEN' },
  { id: 'yellow', hex: '#F2C23E', word: 'YELLOW' },
];

export const DURATION_SECONDS = 60;

/** Session count at which the completion screen switches to the
 *  "Still with you." variant that steers toward another redirect. */
export const STEER_AFTER_SESSIONS = 3;

export type Trial = { word: Ink; ink: Ink };

/** Ink is never the colour the word names (otherwise there's no conflict).
 *  Also avoids repeating the exact previous pairing. */
export function makeTrial(prev?: Trial | null): Trial {
  let word: Ink, ink: Ink;
  do {
    word = INKS[Math.floor(Math.random() * INKS.length)];
    ink  = INKS[Math.floor(Math.random() * INKS.length)];
  } while (ink.id === word.id || (prev && word.id === prev.word.id && ink.id === prev.ink.id));
  return { word, ink };
}

/** True when the tap matches the INK (not the word). A false result must
 *  produce no visible, audible or haptic response — see README. */
export function isCorrect(trial: Trial, tapped: InkId): boolean {
  return trial.ink.id === tapped;
}

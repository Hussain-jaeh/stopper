// components/stickers/stickerTokens.ts
// Tone ramps + sizes for the Stopper sticker system.
// Every sticker = a Lucide glyph on a gradient disc. The disc does the branding.

export type StickerTone = 'jade' | 'coral' | 'gold' | 'blue' | 'violet' | 'slate';

/** [light, deep, glow] — disc gradients run light (upper-left) → deep (lower-right). */
export const STICKER_TONES: Record<StickerTone, [string, string, string]> = {
  jade:   ['#2DD4A0', '#0C6B4E', 'rgba(20,184,136,0.55)'],
  coral:  ['#FF8A6B', '#B93C22', 'rgba(255,107,74,0.50)'],
  gold:   ['#F5C15A', '#B07A12', 'rgba(242,178,62,0.48)'],
  blue:   ['#5FA8FF', '#14528F', 'rgba(46,125,209,0.48)'],
  violet: ['#B794F4', '#5B32A8', 'rgba(123,79,212,0.48)'],
  slate:  ['#4A5654', '#232928', 'rgba(255,255,255,0.10)'],
};

export const STICKER_SIZES = { sm: 40, md: 50, lg: 64, xl: 92, hero: 150 } as const;
export type StickerSize = keyof typeof STICKER_SIZES | number;

export function resolveSize(size: StickerSize): number {
  return typeof size === 'number' ? size : STICKER_SIZES[size];
}

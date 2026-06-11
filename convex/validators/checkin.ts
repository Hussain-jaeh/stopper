


import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const VALID_MOODS = ["great", "good", "okay", "bad", "terrible"] as const;
export type Mood = (typeof VALID_MOODS)[number];

export const checkInArgs = {
  mood: v.string(),
  cravingLevel: v.number(),
  note: v.optional(v.string()),
};

export function validateCheckIn(args: {
  mood: string;
  cravingLevel: number;
  note?: string;
}): void {
  if (!(VALID_MOODS as readonly string[]).includes(args.mood))
    throw new ConvexError(
      `Invalid mood. Must be one of: ${VALID_MOODS.join(", ")}`,
    );

  if (
    !Number.isInteger(args.cravingLevel) ||
    args.cravingLevel < 0 ||
    args.cravingLevel > 10
  )
    throw new ConvexError("Invalid craving level. Must be an integer 0–10");
}

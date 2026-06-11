import { v } from "convex/values";
import { ConvexError } from "convex/values";

/** Convex arg schema for creating a profile. */
export const createProfileArgs = {
  addictionType: v.string(),
  quitDate: v.number(),
  reasonForQuitting: v.string(),
  goal: v.optional(v.string()),
};

/** Convex arg schema for updating a profile (all fields optional). */
export const updateProfileArgs = {
  addictionType: v.optional(v.string()),
  quitDate: v.optional(v.number()),
  reasonForQuitting: v.optional(v.string()),
  goal: v.optional(v.string()),
};

type CreateArgs = {
  addictionType: string;
  quitDate: number;
  reasonForQuitting: string;
  goal?: string;
};

type UpdateArgs = Partial<CreateArgs>;

export function validateCreateProfile(args: CreateArgs): void {
  if (!args.addictionType.trim())
    throw new ConvexError("Addiction type is required");
  if (!args.reasonForQuitting.trim())
    throw new ConvexError("Reason for quitting is required");
  if (args.quitDate > Date.now())
    throw new ConvexError("Quit date cannot be in the future");
  if (args.goal !== undefined && !args.goal.trim())
    throw new ConvexError("Goal cannot be empty if provided");
}

export function validateUpdateProfile(args: UpdateArgs): void {
  if (args.addictionType !== undefined && !args.addictionType.trim())
    throw new ConvexError("Addiction type cannot be empty");
  if (args.reasonForQuitting !== undefined && !args.reasonForQuitting.trim())
    throw new ConvexError("Reason for quitting cannot be empty");
  if (args.quitDate !== undefined && args.quitDate > Date.now())
    throw new ConvexError("Quit date cannot be in the future");
  if (args.goal !== undefined && !args.goal.trim())
    throw new ConvexError("Goal cannot be empty if provided");
}

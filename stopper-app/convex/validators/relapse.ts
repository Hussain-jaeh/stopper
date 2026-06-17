import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const relapseArgs = {
  trigger: v.string(),
  note: v.optional(v.string()),
};

export function validateRelapse(args: { trigger: string; note?: string }): void {
  if (!args.trigger.trim()) throw new ConvexError("Trigger is required");
}

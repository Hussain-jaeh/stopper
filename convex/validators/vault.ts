import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Milestone days that trigger the "record a reflection" prompt.
// Aligned with the app's real milestone list (services/streak.ts) — not the
// design handoff's 100, which users never see elsewhere.
export const VAULT_MILESTONES = [7, 30, 90, 365] as const;

export const saveRecordingArgs = {
  storageId: v.id("_storage"),
  thumbStorageId: v.optional(v.id("_storage")),
  durationSeconds: v.number(),
};

export function validateSaveRecording(args: { durationSeconds: number }): void {
  if (
    !Number.isInteger(args.durationSeconds) ||
    args.durationSeconds < 1 ||
    args.durationSeconds > 61
  )
    throw new ConvexError("Invalid duration. Must be an integer 1–61 seconds");
}

export function validateTitle(title: string): void {
  const trimmed = title.trim();
  if (trimmed.length === 0)
    throw new ConvexError("Title cannot be empty");
  if (trimmed.length > 80)
    throw new ConvexError("Title must be 80 characters or fewer");
}

import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Asserts the caller is authenticated and returns their userId.
 * Throws a ConvexError("Unauthorized") so the client gets a typed error
 * rather than a generic crash.
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Unauthorized");
  return userId;
}

import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getCurrentSeller(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const seller = await ctx.db
    .query("sellers")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return seller;
}

export async function requireSeller(ctx: QueryCtx | MutationCtx) {
  const seller = await getCurrentSeller(ctx);
  if (!seller) {
    throw new Error("Seller not found. Please complete onboarding.");
  }
  return seller;
}

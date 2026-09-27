import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

/** Returns a short-lived URL the admin client can POST an image to. */
export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    return await ctx.storage.generateUploadUrl();
  },
});

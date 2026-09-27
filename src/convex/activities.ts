import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { defined } from "./helpers";

async function withPhoto(ctx: QueryCtx, activity: Doc<"activities">) {
  const photoUrl = activity.photoId ? await ctx.storage.getUrl(activity.photoId) : null;
  return {
    _id: activity._id,
    title: activity.title,
    description: activity.description,
    date: activity.date,
    photoUrl,
  };
}

/** Public list of activities, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const activities = await ctx.db.query("activities").withIndex("by_date").collect();
    const sorted = activities.sort((a, b) => (a.date < b.date ? 1 : -1));
    return await Promise.all(sorted.map((a) => withPhoto(ctx, a)));
  },
});

const activityInput = {
  title: v.string(),
  description: v.string(),
  date: v.string(),
  photoId: v.optional(v.id("_storage")),
};

export const create = mutation({
  args: { token: v.string(), ...activityInput },
  handler: async (ctx, { token, ...data }) => {
    await requireAdmin(ctx, token);
    return await ctx.db.insert("activities", defined(data));
  },
});

export const update = mutation({
  args: { token: v.string(), id: v.id("activities"), ...activityInput },
  handler: async (ctx, { token, id, ...data }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(id, defined(data));
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("activities") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);
    await ctx.db.delete(id);
  },
});

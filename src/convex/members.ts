import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { defined } from "./helpers";

async function withPhoto(ctx: QueryCtx, member: Doc<"members">) {
  const photoUrl = member.photoId ? await ctx.storage.getUrl(member.photoId) : null;
  return {
    _id: member._id,
    name: member.name,
    position: member.position,
    description: member.description,
    order: member.order,
    photoUrl,
  };
}

/** Public list of members, ordered by the admin-defined `order`. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db.query("members").withIndex("by_order").collect();
    return await Promise.all(members.map((m) => withPhoto(ctx, m)));
  },
});

const memberInput = {
  name: v.string(),
  position: v.string(),
  description: v.string(),
  photoId: v.optional(v.id("_storage")),
  order: v.optional(v.number()),
};

export const create = mutation({
  args: { token: v.string(), ...memberInput },
  handler: async (ctx, { token, order, ...data }) => {
    await requireAdmin(ctx, token);
    const count = (await ctx.db.query("members").collect()).length;
    return await ctx.db.insert("members", defined({ ...data, order: order ?? count }));
  },
});

export const update = mutation({
  args: { token: v.string(), id: v.id("members"), ...memberInput },
  handler: async (ctx, { token, id, ...data }) => {
    await requireAdmin(ctx, token);
    await ctx.db.patch(id, defined(data));
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("members") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);
    await ctx.db.delete(id);
  },
});

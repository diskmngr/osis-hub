import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";

/** Visitors submit aspirations without logging in. Basic server-side guards. */
export const submit = mutation({
  args: { name: v.string(), email: v.string(), message: v.string() },
  handler: async (ctx, { name, email, message }) => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      throw new Error("Semua kolom wajib diisi.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      throw new Error("Format email tidak valid.");
    }
    await ctx.db.insert("aspirations", {
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
    });
  },
});

/** Admin-only list, newest first. */
export const list = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const rows = await ctx.db.query("aspirations").order("desc").collect();
    return rows;
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("aspirations") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);
    await ctx.db.delete(id);
  },
});

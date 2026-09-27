import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Fixed admin credentials for version 1, per the product spec
 * (contoh: admin / admin123). Only one admin account is needed — no roles.
 */
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// Sessions last 7 days; the browser keeps the token in localStorage.
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type Ctx = QueryCtx | MutationCtx;

/** Cryptographically random hex token for admin sessions. */
function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Throws when the supplied token is missing, unknown or expired. */
export async function requireAdmin(ctx: Ctx, token: string | undefined) {
  if (!token) throw new Error("Unauthorized");
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized");
  }
  return session;
}

/** Sign in with the fixed credentials and return a session token. */
export const login = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, { username, password }) => {
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      throw new Error("Username atau password salah.");
    }
    const token = randomToken();
    await ctx.db.insert("adminSessions", {
      token,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    return { token };
  },
});

/** Check whether a stored token is still valid. */
export const check = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    if (!token) return false;
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    return !!session && session.expiresAt >= Date.now();
  },
});

/** Invalidate the current session. */
export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (session) await ctx.db.delete(session._id);
  },
});

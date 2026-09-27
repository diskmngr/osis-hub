import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAuth";
import { defined } from "./helpers";

const KEY = "site";

export const DEFAULT_SETTINGS = {
  orgName: "OSIS Nusantara",
  welcomeText:
    "Selamat datang di situs resmi OSIS Nusantara. Kami menghadirkan informasi anggota, agenda kegiatan, dan ruang aspirasi bagi seluruh siswa. Suara Anda membentuk sekolah yang lebih baik.",
};

/** Public read of editable site settings, with sane defaults. */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", KEY))
      .unique();
    const logoUrl = settings?.logoId ? await ctx.storage.getUrl(settings.logoId) : null;
    return {
      orgName: settings?.orgName ?? DEFAULT_SETTINGS.orgName,
      welcomeText: settings?.welcomeText ?? DEFAULT_SETTINGS.welcomeText,
      logoUrl,
    };
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    orgName: v.string(),
    welcomeText: v.string(),
    logoId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { token, orgName, welcomeText, logoId }) => {
    await requireAdmin(ctx, token);
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", KEY))
      .unique();
    const patch = {
      orgName: orgName.trim() || DEFAULT_SETTINGS.orgName,
      welcomeText: welcomeText.trim(),
      ...(logoId !== undefined ? { logoId } : {}),
    };
    if (settings) {
      await ctx.db.patch(settings._id, defined(patch));
    } else {
      await ctx.db.insert("siteSettings", defined({ key: KEY, ...patch }));
    }
  },
});

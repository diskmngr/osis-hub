import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // OSIS member profiles shown on the public page.
    members: defineTable({
      name: v.string(),
      position: v.string(),
      description: v.string(),
      photoId: v.optional(v.id("_storage")),
      order: v.number(),
    }).index("by_order", ["order"]),

    // OSIS activities / events.
    activities: defineTable({
      title: v.string(),
      description: v.string(),
      date: v.string(), // ISO date, e.g. "2026-08-17"
      photoId: v.optional(v.id("_storage")),
    }).index("by_date", ["date"]),

    // Aspirations submitted by visitors through the public form.
    aspirations: defineTable({
      name: v.string(),
      email: v.string(),
      message: v.string(),
    }),

    // Singleton row (key = "site") holding editable site settings.
    siteSettings: defineTable({
      key: v.string(),
      orgName: v.string(),
      welcomeText: v.string(),
      logoId: v.optional(v.id("_storage")),
    }).index("by_key", ["key"]),

    // Fixed-credential admin sessions (token stored in the browser).
    adminSessions: defineTable({
      token: v.string(),
      expiresAt: v.number(),
    }).index("by_token", ["token"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;

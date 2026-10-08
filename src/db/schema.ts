import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  colorKey: text("color_key").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    body: text("body").notNull().default(""),
    galleryKeys: text("gallery_keys").array().notNull().default([]),
    youtubeUrl: text("youtube_url"),
    facebookUrl: text("facebook_url"),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("posts_feed_idx").on(t.categoryId, t.published, t.publishedAt)],
);

export const ROLE_GROUPS = [
  "director",
  "president",
  "secretary",
  "treasurer",
  "member", // நிர்வாகசபை உறுப்பினர்கள் (the committee members)
  "patron",
  "general", // உறுப்பினர்கள் (ordinary members, shown last)
] as const;
export type RoleGroup = (typeof ROLE_GROUPS)[number];

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  roleTitle: text("role_title").notNull(),
  roleGroup: text("role_group").$type<RoleGroup>().notNull(),
  subtitle: text("subtitle"),
  photoKey: text("photo_key"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const PROGRAMME_KINDS = ["once", "weekly"] as const;
export type ProgrammeKind = (typeof PROGRAMME_KINDS)[number];

// The radio programme schedule shown on the Radio page. Times are Sri Lanka time, written "HH:MM" (24 hour).
// A "once" programme has a date; a "weekly" one has a weekday (0 = Sunday ... 6 = Saturday) and repeats every week.
export const radioProgrammes = pgTable("radio_programmes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  kind: text("kind").$type<ProgrammeKind>().notNull(),
  onDate: date("on_date", { mode: "string" }),
  weekday: integer("weekday"),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export const loginAttempts = pgTable("login_attempts", {
  key: text("key").primaryKey(),
  failedCount: integer("failed_count").notNull().default(0),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

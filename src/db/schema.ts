import {
  boolean,
  date,
  index,
  integer,
  jsonb,
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

// ---------------------------------------------------------------------------------------------------------------
// The registry of Tamil writers and artists ("படைப்பாளிகள் பதிவகம்", the /directory pages).
// The admin designs the registration form (directory_fields), visitors send entries (directory_entries), the admin
// approves them, and only the fields switched to "public" are ever shown.
// ---------------------------------------------------------------------------------------------------------------

export const DIRECTORY_FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "select",
  "multiselect",
  "url",
  "links",
  "email",
  "tel",
  "photo",
] as const;
export type DirectoryFieldType = (typeof DIRECTORY_FIELD_TYPES)[number];

// public = always shown on the profile; private = only the admin (and a reviewer, if allowed) sees it;
// applicant = the person ticks "show this publicly" on the form.
export const DIRECTORY_VISIBILITIES = ["public", "private", "applicant"] as const;
export type DirectoryVisibility = (typeof DIRECTORY_VISIBILITIES)[number];

export const DIRECTORY_STATUSES = ["pending", "approved", "update_needed", "rejected", "withdrawn"] as const;
export type DirectoryStatus = (typeof DIRECTORY_STATUSES)[number];

export const directoryFields = pgTable("directory_fields", {
  id: serial("id").primaryKey(),
  // A short code that never changes: "name", "bio", "email" ... or "c_xxxxxx" for a field the admin added.
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  help: text("help").notNull().default(""),
  type: text("type").$type<DirectoryFieldType>().notNull().default("text"),
  // The choices of a "select" / "multiselect" field.
  options: text("options").array().notNull().default([]),
  section: text("section").notNull().default("other"),
  required: boolean("required").notNull().default(false),
  onForm: boolean("on_form").notNull().default(true),
  visibility: text("visibility").$type<DirectoryVisibility>().notNull().default("private"),
  filterable: boolean("filterable").notNull().default(false),
  // Built-in fields can be switched and reworded but not deleted (the list, search and profile depend on them).
  builtin: boolean("builtin").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const directoryEntries = pgTable(
  "directory_entries",
  {
    id: serial("id").primaryKey(),
    // AP-ART-00001. Given when the entry is first approved, and never changes after that.
    code: text("code").unique(),
    status: text("status").$type<DirectoryStatus>().notNull().default("pending"),
    name: text("name").notNull(),
    photoKey: text("photo_key"),
    artFields: text("art_fields").array().notNull().default([]),
    // "lk" = lives in Sri Lanka, "abroad" = lives in another country.
    residence: text("residence").notNull().default("lk"),
    country: text("country").notNull().default(""),
    district: text("district").notNull().default(""),
    dsDivision: text("ds_division").notNull().default(""),
    gnDivision: text("gn_division").notNull().default(""),
    postalCode: text("postal_code").notNull().default(""),
    city: text("city").notNull().default(""),
    nativeDistrict: text("native_district").notNull().default(""),
    // The answers to all the other questions, by field key.
    answers: jsonb("answers").$type<Record<string, string | string[]>>().notNull().default({}),
    // For "applicant chooses" fields: which ones the person agreed to show publicly.
    shareChoices: jsonb("share_choices").$type<Record<string, boolean>>().notNull().default({}),
    consentAt: timestamp("consent_at", { withTimezone: true }),
    consentText: text("consent_text").notNull().default(""),
    adminNote: text("admin_note").notNull().default(""),
    // The reason shown to the admin when an entry is rejected or needs an update.
    statusReason: text("status_reason").notNull().default(""),
    source: text("source").notNull().default("public"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("directory_entries_status_idx").on(t.status, t.submittedAt),
    index("directory_entries_place_idx").on(t.residence, t.country, t.district),
  ],
);

// A reviewer: one secret link and one password, kept for as long as the link works, and the list of people the admin has
// sent to them (more can be added at any time, the link and the password stay the same).
export const directoryReviews = pgTable("directory_reviews", {
  id: serial("id").primaryKey(),
  // A fingerprint of the secret link, to find the reviewer when the link is opened.
  tokenHash: text("token_hash").notNull().unique(),
  // The link and the password again, locked with the site's secret key, so the admin can look at them whenever needed.
  // Nothing readable is stored. (Empty for a reviewer made before this existed.)
  tokenSealed: text("token_sealed"),
  passwordSealed: text("password_sealed"),
  reviewerName: text("reviewer_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  canSeePrivate: boolean("can_see_private").notNull().default(false),
  entryIds: integer("entry_ids").array().notNull().default([]),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Everything that happens to an entry: who changed what, and the reviewers' recommendations.
export const directoryActivity = pgTable(
  "directory_activity",
  {
    id: serial("id").primaryKey(),
    entryId: integer("entry_id")
      .notNull()
      .references(() => directoryEntries.id, { onDelete: "cascade" }),
    reviewId: integer("review_id").references(() => directoryReviews.id, { onDelete: "set null" }),
    // "applicant", "admin" or "reviewer: <name>".
    actor: text("actor").notNull(),
    // submitted, edited, approved, rejected, update_needed, withdrawn, recommend_approve, recommend_fix, note
    action: text("action").notNull(),
    detail: text("detail").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("directory_activity_entry_idx").on(t.entryId, t.createdAt)],
);

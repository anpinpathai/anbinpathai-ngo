-- =====================================================================================================
-- THE REGISTRY OF WRITERS AND ARTISTS: set up the LIVE database by hand, in the Neon console
-- =====================================================================================================
--
-- What this does. Nothing that exists is changed or deleted; it only ADDS:
--   1. the 4 Registry tables                      (the same as drizzle/0007_rare_lethal_legion.sql)
--   2. 2 more columns in directory_reviews        (the same as drizzle/0008_reviewer_secrets.sql)
--   3. a note that those two files are done, so "npm run db:migrate" never runs them a second time
--   4. the 30 form questions (the standard ones and "Date of birth"), written the way they are on staging
--
-- How to use it:
--   1. Neon console > your project > the branch "production" (check the branch name at the top!) > SQL Editor.
--   2. Paste ALL of this text. Press Run.
--   3. The result at the very end is a small table. It must say:  tables_found 4 | reviewer_columns 2 | questions 30 | updates_recorded 2
--
-- It is safe to run twice: what already exists is left alone. Part 0 stops everything (and changes nothing)
-- if this is not the website database, or if it is missing earlier updates.
-- =====================================================================================================


-- ---- Part 0: safety checks ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.posts') IS NULL THEN
    RAISE EXCEPTION 'STOPPED: this is not the website database (there is no "posts" table). Check the branch and the database at the top of the SQL Editor. Nothing was changed.';
  END IF;
  IF to_regclass('drizzle.__drizzle_migrations') IS NULL THEN
    RAISE EXCEPTION 'STOPPED: the list of earlier database updates was not found. Nothing was changed. Ask the developer.';
  END IF;
  IF (SELECT coalesce(max(created_at), 0) FROM drizzle.__drizzle_migrations) < 1791422164572 THEN
    RAISE EXCEPTION 'STOPPED: this database is missing earlier updates (0000 to 0006). Nothing was changed. Ask the developer.';
  END IF;
END $$;


-- ---- Part 1: the 4 tables (drizzle/0007_rare_lethal_legion.sql) -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "directory_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"review_id" integer,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "directory_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"name" text NOT NULL,
	"photo_key" text,
	"art_fields" text[] DEFAULT '{}' NOT NULL,
	"residence" text DEFAULT 'lk' NOT NULL,
	"country" text DEFAULT '' NOT NULL,
	"district" text DEFAULT '' NOT NULL,
	"ds_division" text DEFAULT '' NOT NULL,
	"gn_division" text DEFAULT '' NOT NULL,
	"postal_code" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"native_district" text DEFAULT '' NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"share_choices" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"consent_at" timestamp with time zone,
	"consent_text" text DEFAULT '' NOT NULL,
	"admin_note" text DEFAULT '' NOT NULL,
	"status_reason" text DEFAULT '' NOT NULL,
	"source" text DEFAULT 'public' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "directory_entries_code_unique" UNIQUE("code")
);

CREATE TABLE IF NOT EXISTS "directory_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"help" text DEFAULT '' NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"options" text[] DEFAULT '{}' NOT NULL,
	"section" text DEFAULT 'other' NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"on_form" boolean DEFAULT true NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"filterable" boolean DEFAULT false NOT NULL,
	"builtin" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "directory_fields_key_unique" UNIQUE("key")
);

CREATE TABLE IF NOT EXISTS "directory_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"reviewer_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"can_see_private" boolean DEFAULT false NOT NULL,
	"entry_ids" integer[] DEFAULT '{}' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"last_opened_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "directory_reviews_token_hash_unique" UNIQUE("token_hash")
);

DO $$ BEGIN
  ALTER TABLE "directory_activity" ADD CONSTRAINT "directory_activity_entry_id_directory_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."directory_entries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "directory_activity" ADD CONSTRAINT "directory_activity_review_id_directory_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."directory_reviews"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "directory_activity_entry_idx" ON "directory_activity" USING btree ("entry_id","created_at");
CREATE INDEX IF NOT EXISTS "directory_entries_status_idx" ON "directory_entries" USING btree ("status","submitted_at");
CREATE INDEX IF NOT EXISTS "directory_entries_place_idx" ON "directory_entries" USING btree ("residence","country","district");


-- ---- Part 2: 2 more columns (drizzle/0008_reviewer_secrets.sql) -----------------------------------------------------
ALTER TABLE "directory_reviews" ADD COLUMN IF NOT EXISTS "token_sealed" text;
ALTER TABLE "directory_reviews" ADD COLUMN IF NOT EXISTS "password_sealed" text;


-- ---- Part 3: note that those two updates are done --------------------------------------------------------
INSERT INTO drizzle."__drizzle_migrations" ("hash", "created_at")
SELECT v."hash", v."created_at"
FROM (VALUES
  ('9da5ecb81744076f4df3acca3325723fd8f13c4cc2469852c69ab8b8b7082278', 1794544758048::bigint),
  ('ea3608d70d6c029ad01c1d70e0cc1fa4cf8670eda4acf07a41fe53ce2a892481', 1794645907051::bigint)
) AS v("hash", "created_at")
WHERE NOT EXISTS (SELECT 1 FROM drizzle."__drizzle_migrations" m WHERE m."created_at" = v."created_at");


-- ---- Part 4: the form questions --------------------------------------------------------------------------
-- A question that already exists (same "key") is left as it is.
INSERT INTO "directory_fields"
  ("key", "label", "help", "type", "options", "section", "required", "on_form", "visibility", "filterable", "builtin", "sort_order")
VALUES
  ('name', 'முழுப்பெயர்', 'உங்கள் முழுப்பெயரைத் தமிழில் எழுதுங்கள்.', 'text', ARRAY[]::text[], 'basic', true, true, 'public', false, true, 10),
  ('pen_name', 'புனைபெயர்', 'புனைபெயர் இருந்தால் மட்டும் எழுதுங்கள்.', 'text', ARRAY[]::text[], 'basic', false, true, 'applicant', false, true, 20),
  ('photo', 'புகைப்படம்', 'உங்கள் தெளிவான புகைப்படம் ஒன்றைச் சேர்க்கலாம்.', 'photo', ARRAY[]::text[], 'basic', false, true, 'applicant', false, true, 30),
  ('occupation', 'தற்போதைய தொழில்', '', 'text', ARRAY[]::text[], 'basic', false, true, 'applicant', false, true, 40),
  ('residence', 'தற்போது நீங்கள் வசிப்பது', '', 'select', ARRAY[]::text[], 'location', true, true, 'public', true, true, 50),
  ('country', 'நாடு', '', 'text', ARRAY[]::text[], 'location', true, true, 'public', true, true, 60),
  ('district', 'மாவட்டம்', '', 'text', ARRAY[]::text[], 'location', true, true, 'public', true, true, 70),
  ('ds_division', 'பிரதேச செயலாளர் பிரிவு', '', 'text', ARRAY[]::text[], 'location', false, true, 'public', true, true, 80),
  ('gn_division', 'கிராம அலுவலர் பிரிவு', '', 'text', ARRAY[]::text[], 'location', false, true, 'private', false, true, 90),
  ('postal_code', 'தபால் குறியீட்டு இலக்கம்', 'ஐந்து இலக்கங்கள்.', 'text', ARRAY[]::text[], 'location', false, true, 'private', false, true, 100),
  ('city', 'நகரம் / ஊர்', '', 'text', ARRAY[]::text[], 'location', false, true, 'public', false, true, 110),
  ('native_district', 'இலங்கையில் பூர்வீக மாவட்டம்', '', 'text', ARRAY[]::text[], 'location', false, true, 'public', true, true, 120),
  ('art_fields', 'கலை இலக்கியத் துறைகள்', 'பொருந்தும் அனைத்தையும் தெரிவு செய்யலாம்.', 'multiselect', ARRAY['கவிஞர்', 'சிறுகதை எழுத்தாளர்', 'நாவலாசிரியர்', 'கட்டுரையாளர்', 'நாடகக் கலைஞர்', 'பாடலாசிரியர்', 'இசைக் கலைஞர்', 'பாடகர்', 'ஓவியர்', 'சிற்பி', 'நாட்டுப்புறக் கலைஞர்', 'கூத்துக் கலைஞர்', 'வில்லுப்பாட்டுக் கலைஞர்', 'ஆய்வாளர்', 'இலக்கிய விமர்சகர்', 'மொழிபெயர்ப்பாளர்', 'ஊடகவியலாளர்', 'நூல் வெளியீட்டாளர்', 'ஆவணப்படக் கலைஞர்', 'புகைப்படக் கலைஞர்', 'கலை இலக்கிய அமைப்பாளர்', 'கலை இலக்கிய ஆர்வலர்', 'ஏனையவை']::text[], 'art', true, true, 'public', true, true, 130),
  ('start_year', 'கலைப்பணியை ஆரம்பித்த ஆண்டு', '', 'number', ARRAY[]::text[], 'journey', false, true, 'applicant', false, true, 140),
  ('books_count', 'வெளியிட்ட நூல்களின் எண்ணிக்கை', '', 'number', ARRAY[]::text[], 'journey', false, true, 'applicant', false, true, 150),
  ('books', 'நூல்களின் பெயர்கள்', 'ஒவ்வொரு நூலையும் புதிய வரியில் எழுதுங்கள்.', 'textarea', ARRAY[]::text[], 'journey', false, true, 'applicant', false, true, 160),
  ('awards', 'பெற்ற விருதுகள்', '', 'textarea', ARRAY[]::text[], 'journey', false, true, 'applicant', false, true, 170),
  ('organizations', 'அங்கம் வகிக்கும் அமைப்புகள்', '', 'textarea', ARRAY[]::text[], 'journey', false, true, 'applicant', false, true, 180),
  ('achievements', 'முக்கிய சாதனைகள்', '', 'textarea', ARRAY[]::text[], 'journey', false, true, 'applicant', false, true, 190),
  ('bio', 'சுய அறிமுகம்', 'உங்களைப் பற்றி 100 முதல் 300 சொற்களில் எழுதுங்கள்.', 'textarea', ARRAY[]::text[], 'about', true, true, 'public', false, true, 200),
  ('work_links', 'படைப்புகளின் இணைப்புகள்', 'ஒவ்வொரு இணைப்பையும் புதிய வரியில் எழுதுங்கள். இணைப்பு https:// என்று தொடங்க வேண்டும்.', 'links', ARRAY[]::text[], 'works', false, true, 'public', false, true, 210),
  ('video_links', 'காணொளி / ஒலி இணைப்புகள்', 'YouTube போன்ற இணைப்புகள். ஒவ்வொன்றையும் புதிய வரியில் எழுதுங்கள்.', 'links', ARRAY[]::text[], 'works', false, true, 'public', false, true, 220),
  ('website', 'இணையத்தளம்', 'https:// என்று தொடங்க வேண்டும்.', 'url', ARRAY[]::text[], 'works', false, true, 'public', false, true, 230),
  ('email', 'மின்னஞ்சல்', '', 'email', ARRAY[]::text[], 'contact', true, true, 'applicant', false, true, 240),
  ('phone', 'தொலைபேசி', '', 'tel', ARRAY[]::text[], 'contact', false, true, 'applicant', false, true, 250),
  ('whatsapp', 'WhatsApp', '', 'tel', ARRAY[]::text[], 'contact', false, true, 'applicant', false, true, 260),
  ('facebook', 'Facebook இணைப்பு', '', 'url', ARRAY[]::text[], 'contact', false, true, 'applicant', false, true, 270),
  ('youtube', 'YouTube இணைப்பு', '', 'url', ARRAY[]::text[], 'contact', false, true, 'applicant', false, true, 280),
  ('other_social', 'பிற சமூக வலைத்தளங்கள்', '', 'links', ARRAY[]::text[], 'contact', false, true, 'applicant', false, true, 290),
  ('date_of_birth', 'பிறந்த திகதி', '', 'date', ARRAY[]::text[], 'basic', false, true, 'private', false, true, 50)
ON CONFLICT ("key") DO NOTHING;


-- ---- Part 5: the check. It must say:  4 | 2 | 30 | 2 ---------------------------------------------------
SELECT
  (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('directory_fields', 'directory_entries', 'directory_reviews', 'directory_activity')) AS tables_found,
  (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'directory_reviews' AND column_name IN ('token_sealed', 'password_sealed')) AS reviewer_columns,
  (SELECT count(*) FROM "directory_fields") AS questions,
  (SELECT count(*) FROM drizzle."__drizzle_migrations" WHERE "created_at" IN (1794544758048, 1794645907051)) AS updates_recorded;

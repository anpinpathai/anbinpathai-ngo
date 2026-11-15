CREATE TABLE "directory_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"review_id" integer,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "directory_entries" (
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
--> statement-breakpoint
CREATE TABLE "directory_fields" (
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
--> statement-breakpoint
CREATE TABLE "directory_reviews" (
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
--> statement-breakpoint
ALTER TABLE "directory_activity" ADD CONSTRAINT "directory_activity_entry_id_directory_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."directory_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "directory_activity" ADD CONSTRAINT "directory_activity_review_id_directory_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."directory_reviews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "directory_activity_entry_idx" ON "directory_activity" USING btree ("entry_id","created_at");--> statement-breakpoint
CREATE INDEX "directory_entries_status_idx" ON "directory_entries" USING btree ("status","submitted_at");--> statement-breakpoint
CREATE INDEX "directory_entries_place_idx" ON "directory_entries" USING btree ("residence","country","district");
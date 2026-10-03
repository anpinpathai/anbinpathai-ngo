CREATE TABLE "login_attempts" (
	"key" text PRIMARY KEY NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"window_started_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "cover_image_url";--> statement-breakpoint
ALTER TABLE "team_members" DROP COLUMN "photo_url";
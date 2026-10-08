CREATE TABLE "radio_programmes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"kind" text NOT NULL,
	"on_date" date,
	"weekday" integer,
	"start_time" text NOT NULL,
	"end_time" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

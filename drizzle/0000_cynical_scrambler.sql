CREATE TABLE "pastes" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"max_views" integer,
	"views_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "positive_max_views" CHECK ("pastes"."max_views" IS NULL OR "pastes"."max_views" >= 1),
	CONSTRAINT "nonnegative_views" CHECK ("pastes"."views_count" >= 0),
	CONSTRAINT "views_within_limit" CHECK ("pastes"."max_views" IS NULL OR "pastes"."views_count" <= "pastes"."max_views")
);

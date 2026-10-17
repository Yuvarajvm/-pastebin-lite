ALTER TABLE "pastes" DROP CONSTRAINT "positive_max_views";--> statement-breakpoint
ALTER TABLE "pastes" ADD COLUMN "title" varchar(120) DEFAULT 'Untitled' NOT NULL;--> statement-breakpoint
ALTER TABLE "pastes" ADD COLUMN "language" varchar(20) DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "pastes" ADD CONSTRAINT "supported_language" CHECK ("pastes"."language" IN ('text', 'javascript', 'typescript', 'json', 'python', 'html', 'css', 'sql', 'bash'));--> statement-breakpoint
ALTER TABLE "pastes" ADD CONSTRAINT "positive_max_views" CHECK ("pastes"."max_views" IS NULL OR "pastes"."max_views" BETWEEN 1 AND 1000000);
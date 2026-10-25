CREATE TABLE "account_deletions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" text,
	"email" varchar(255) NOT NULL,
	"normalized_email" varchar(255) NOT NULL,
	"trial_claimed" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pastes" DROP CONSTRAINT "pastes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "pastes" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trial_claimed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "account_deletions_normalized_email_idx" ON "account_deletions" USING btree ("normalized_email");--> statement-breakpoint
CREATE INDEX "pastes_user_id_idx" ON "pastes" USING btree ("user_id");
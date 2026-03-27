ALTER TABLE "integrations" ADD COLUMN "base_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "integrations" ADD COLUMN "queues" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "queue_id" text;

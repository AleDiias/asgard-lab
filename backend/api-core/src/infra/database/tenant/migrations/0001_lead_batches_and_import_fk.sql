CREATE TABLE "lead_import_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"imported_count" integer NOT NULL,
	"removed_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "import_batch_id" uuid;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_import_batch_id_lead_import_batches_id_fk" FOREIGN KEY ("import_batch_id") REFERENCES "public"."lead_import_batches"("id") ON DELETE no action ON UPDATE no action;
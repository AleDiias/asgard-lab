CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TYPE "public"."lead_status" AS ENUM('novo', 'em_atendimento', 'finalizado');
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"status" "lead_status" DEFAULT 'novo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_phone_unique" UNIQUE("phone")
);

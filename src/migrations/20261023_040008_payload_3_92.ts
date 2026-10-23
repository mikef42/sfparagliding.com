import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Payload 3.89 -> 3.92 (2026-10-22). Generated with `payload migrate:create` against a copy of the
// production database, then made idempotent: production was built with dev-mode push and had never
// run a migration, so this one must be safe whether or not a column is already there. It adds
// Payload 3.90's resetPasswordRequestedAt on the auth collection and the sitemap settings fields
// added to the global after the March snapshot. `_objectKey` is not added: this config has no
// client uploads, and the schema diff did not ask for it.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_sitemap_settings_generation_frequency" AS ENUM('manual', 'hourly', 'daily', 'weekly', 'monthly');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_sitemap_settings_last_generation_status" AS ENUM('success', 'failed');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_requested_at" timestamp(3) with time zone;
  ALTER TABLE "sitemap_settings" ADD COLUMN IF NOT EXISTS "generation_frequency" "enum_sitemap_settings_generation_frequency" DEFAULT 'manual';
  ALTER TABLE "sitemap_settings" ADD COLUMN IF NOT EXISTS "last_generated_at" timestamp(3) with time zone;
  ALTER TABLE "sitemap_settings" ADD COLUMN IF NOT EXISTS "last_generated_count" numeric;
  ALTER TABLE "sitemap_settings" ADD COLUMN IF NOT EXISTS "last_generation_status" "enum_sitemap_settings_last_generation_status";
  ALTER TABLE "sitemap_settings" ADD COLUMN IF NOT EXISTS "last_generation_message" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_requested_at";
  ALTER TABLE "sitemap_settings" DROP COLUMN IF EXISTS "generation_frequency";
  ALTER TABLE "sitemap_settings" DROP COLUMN IF EXISTS "last_generated_at";
  ALTER TABLE "sitemap_settings" DROP COLUMN IF EXISTS "last_generated_count";
  ALTER TABLE "sitemap_settings" DROP COLUMN IF EXISTS "last_generation_status";
  ALTER TABLE "sitemap_settings" DROP COLUMN IF EXISTS "last_generation_message";
  DROP TYPE IF EXISTS "public"."enum_sitemap_settings_generation_frequency";
  DROP TYPE IF EXISTS "public"."enum_sitemap_settings_last_generation_status";`)
}

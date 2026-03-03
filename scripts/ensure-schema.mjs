/**
 * Ensures all required database tables exist.
 * Runs at container startup BEFORE the Next.js server.
 * Uses the pg module (already installed via @payloadcms/db-postgres).
 */
import pg from 'pg'

const { Client } = pg

async function ensureSchema() {
  const connectionString = process.env.DATABASE_URI
  if (!connectionString) {
    console.log('[ensure-schema] No DATABASE_URI, skipping.')
    process.exit(0)
  }

  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log('[ensure-schema] Connected to database.')

    // Drop the old broken table (had integer id instead of varchar)
    await client.query(`DROP TABLE IF EXISTS "pages_blocks_code_embed" CASCADE`).catch(() => {})

    // Create block tables for the pages collection.
    // Payload 3.x uses varchar IDs (MongoDB-style ObjectId strings), not serial integers.
    const statements = [
      `CREATE TABLE IF NOT EXISTS "pages_blocks_code_embed" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "_path" text NOT NULL,
        "id" varchar PRIMARY KEY,
        "label" varchar,
        "code" text NOT NULL DEFAULT '',
        "max_width" varchar DEFAULT 'wide',
        "block_name" varchar,
        CONSTRAINT "pages_blocks_code_embed_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "pages"("id") ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS "pages_blocks_code_embed_order_idx"
        ON "pages_blocks_code_embed" ("_order")`,
      `CREATE INDEX IF NOT EXISTS "pages_blocks_code_embed_parent_id_idx"
        ON "pages_blocks_code_embed" ("_parent_id")`,
      `CREATE INDEX IF NOT EXISTS "pages_blocks_code_embed_path_idx"
        ON "pages_blocks_code_embed" ("_path")`,
    ]

    for (const sql of statements) {
      try {
        await client.query(sql)
      } catch (err) {
        // Ignore "already exists" errors
        if (!err.message?.includes('already exists')) {
          console.error('[ensure-schema] SQL error:', err.message)
        }
      }
    }

    console.log('[ensure-schema] Schema verification complete.')
  } catch (err) {
    console.error('[ensure-schema] Connection error:', err.message)
  } finally {
    await client.end()
  }
}

ensureSchema()

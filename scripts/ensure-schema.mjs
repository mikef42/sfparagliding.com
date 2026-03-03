/**
 * Ensures the CodeEmbed block table exists with correct schema.
 * Runs at container startup BEFORE the Next.js server.
 *
 * IMPORTANT: Only drops/recreates the table if the 'id' column has the
 * wrong data type (serial/integer instead of varchar). Otherwise, it
 * creates the table if missing and leaves existing data intact.
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

    // Check if the table exists and whether the id column is the correct type
    const check = await client.query(`
      SELECT data_type FROM information_schema.columns
      WHERE table_name = 'pages_blocks_code_embed' AND column_name = 'id'
    `)

    if (check.rows.length > 0) {
      const idType = check.rows[0].data_type
      if (idType === 'character varying' || idType === 'text') {
        // Table exists with correct id type — nothing to do
        console.log('[ensure-schema] pages_blocks_code_embed table OK (id type: ' + idType + ').')
        return
      }
      // Table exists but id column is wrong type (integer/serial) — drop and recreate
      console.log('[ensure-schema] Fixing id column type from ' + idType + ' to varchar...')
      await client.query(`DROP TABLE IF EXISTS "pages_blocks_code_embed" CASCADE`)
    }

    // Create the table (either first time or after dropping broken one)
    console.log('[ensure-schema] Creating pages_blocks_code_embed table...')

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

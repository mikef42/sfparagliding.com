/**
 * Database initialization script
 * Runs Payload initialization to push schema to fresh database.
 * Called before the Next.js server starts in production.
 */
import { getPayload } from 'payload'
import config from '../payload.config'

async function init() {
  console.log('[db-init] Initializing Payload and pushing database schema...')
  try {
    const payload = await getPayload({ config })
    console.log('[db-init] Database schema ready.')

    // Check if admin user exists, create one if not
    const users = await payload.find({ collection: 'users', limit: 1 })
    if (users.totalDocs === 0) {
      console.log('[db-init] No users found. Creating default admin user...')
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@sfparagliding.com',
          password: 'changeme123',
          name: 'Admin',
          role: 'admin',
        },
      })
      console.log('[db-init] Default admin created: admin@sfparagliding.com / changeme123')
      console.log('[db-init] ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!')
    } else {
      console.log('[db-init] Admin user already exists, skipping.')
    }

    process.exit(0)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[db-init] Error:', message)
    process.exit(1)
  }
}

init()

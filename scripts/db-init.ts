/**
 * Database initialization script
 * Runs Payload initialization with push:true to create tables in fresh database.
 * Must be run with NODE_ENV=development so Payload's schema push activates.
 */
import { getPayload } from 'payload'
import config from '../payload.config'

async function init() {
  console.log('[db-init] Initializing Payload and pushing database schema...')
  console.log('[db-init] NODE_ENV:', process.env.NODE_ENV)

  try {
    const payload = await getPayload({ config })
    console.log('[db-init] Payload initialized.')

    // Verify tables exist by counting users
    try {
      const users = await payload.find({ collection: 'users', limit: 1 })
      console.log('[db-init] Database tables verified. Users count:', users.totalDocs)

      if (users.totalDocs === 0) {
        console.log('[db-init] No users found. Creating admin user...')
        await payload.create({
          collection: 'users',
          data: {
            email: 'mikefifield@gmail.com',
            password: 'S00it$xlr8',
            name: 'Mike Fifield',
            role: 'admin',
          },
        })
        console.log('[db-init] Admin user created successfully.')
      } else {
        // Update existing admin user credentials if needed
        const existingUser = users.docs[0]
        if (existingUser.email !== 'mikefifield@gmail.com') {
          console.log('[db-init] Updating admin user credentials...')
          await payload.update({
            collection: 'users',
            id: existingUser.id,
            data: {
              email: 'mikefifield@gmail.com',
              password: 'S00it$xlr8',
              name: 'Mike Fifield',
              role: 'admin',
            },
          })
          console.log('[db-init] Admin credentials updated.')
        } else {
          console.log('[db-init] Admin user already configured, skipping.')
        }
      }
    } catch (queryErr: unknown) {
      const msg = queryErr instanceof Error ? queryErr.message : String(queryErr)
      console.error('[db-init] Table verification failed:', msg)

      // Try to explicitly call the push/migrate methods
      console.log('[db-init] Attempting manual schema push...')
      try {
        if (typeof (payload.db as any).pushSchema === 'function') {
          await (payload.db as any).pushSchema()
          console.log('[db-init] pushSchema() succeeded')
        } else if (typeof (payload.db as any).push === 'function') {
          await (payload.db as any).push({ forceAcceptWarning: true })
          console.log('[db-init] push() succeeded')
        } else {
          // List available methods for debugging
          const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(payload.db))
            .filter(m => m !== 'constructor')
          console.log('[db-init] Available DB methods:', methods.join(', '))
        }
      } catch (pushErr: unknown) {
        const pushMsg = pushErr instanceof Error ? pushErr.message : String(pushErr)
        console.error('[db-init] Manual push failed:', pushMsg)
      }
    }

    process.exit(0)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[db-init] Initialization error:', message)
    process.exit(1)
  }
}

init()

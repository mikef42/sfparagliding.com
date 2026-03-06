import { Client, Environment } from 'square'
import { getPayload } from '@/lib/payload'

/**
 * Reads Square credentials from Site Settings (Payments tab),
 * falling back to environment variables if not configured in CMS.
 */
async function getSquareConfig() {
  try {
    const payload = await getPayload()
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payments = (settings as any)?.payments

    if (payments?.squareAccessToken && payments?.squareLocationId) {
      return {
        accessToken: payments.squareAccessToken,
        locationId: payments.squareLocationId,
        appId: payments.squareAppId || '',
        environment:
          payments.squareEnvironment === 'production'
            ? Environment.Production
            : Environment.Sandbox,
        environmentName: (payments.squareEnvironment as string) || 'sandbox',
        paymentsEnabled: payments.paymentsEnabled !== false,
      }
    }
  } catch (err) {
    console.error('[Square] Failed to read config from SiteSettings, using env vars:', err)
  }

  // Fallback to environment variables
  return {
    accessToken: process.env.SQUARE_ACCESS_TOKEN || '',
    locationId: process.env.SQUARE_LOCATION_ID || '',
    appId: process.env.NEXT_PUBLIC_SQUARE_APP_ID || '',
    environment:
      process.env.SQUARE_ENVIRONMENT === 'production'
        ? Environment.Production
        : Environment.Sandbox,
    environmentName: process.env.SQUARE_ENVIRONMENT || 'sandbox',
    paymentsEnabled: true,
  }
}

/**
 * Returns an authenticated Square Client + location ID.
 * Reads from SiteSettings first, then falls back to env vars.
 */
export async function getSquareClient() {
  const config = await getSquareConfig()

  const client = new Client({
    accessToken: config.accessToken,
    environment: config.environment,
  })

  return {
    client,
    locationId: config.locationId,
    paymentsEnabled: config.paymentsEnabled,
  }
}

/**
 * Returns the public-safe Square config (NO access token).
 * Used by the /api/square-config endpoint to pass config to the frontend.
 */
export async function getSquarePublicConfig() {
  const config = await getSquareConfig()

  return {
    appId: config.appId,
    locationId: config.locationId,
    environment: config.environmentName,
    paymentsEnabled: config.paymentsEnabled,
  }
}

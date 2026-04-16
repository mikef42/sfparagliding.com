import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact | SF Paragliding',
  description: 'Get in touch with SF Paragliding for tandem flights, lessons, and more.',
}

export default async function ContactPage() {
  let contact: {
    heading?: string | null
    description?: string | null
    hours?: string | null
  } = {}

  try {
    const settings = await getSiteSettings()
    contact = (settings as any)?.contact || {}
  } catch (error) {
    console.error('[ContactPage] Error fetching site settings:', error)
    // Fall back to defaults below
  }

  const heading = contact.heading || 'Get in Touch'
  const description =
    contact.description ||
    "Have questions about tandem flights, lessons, or gift certificates? We'd love to hear from you!"
  const addressLine1 = '50 W Manor Dr 1001'
  const addressLine2 = 'Pacifica, California 94044'
  const hours = contact.hours

  return (
    <div className="py-12 lg:py-16">
      <div className="container-narrow">
        <h1 className="section-heading text-2xl mb-2">Contact Us</h1>
        <div className="section-divider" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="font-heading text-xl tracking-wide mb-4">{heading}</h2>
            <p className="text-gray-600 mb-6">{description}</p>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-brand-amber flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium">Location</p>
                  <p>{addressLine1}</p>
                  {addressLine2 && <p className="text-gray-500">{addressLine2}</p>}
                </div>
              </div>
              {hours && (
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-brand-amber flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Hours</p>
                    <p>{hours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-heading text-xl tracking-wide mb-4">Send a Message</h2>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  className="w-full border border-gray-300 rounded px-4 py-3 text-sm
                           focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-colors"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="w-full border border-gray-300 rounded px-4 py-3 text-sm
                           focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-colors"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  className="w-full border border-gray-300 rounded px-4 py-3 text-sm
                           focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-colors resize-none"
                  required
                />
              </div>
              <button type="submit" className="btn-primary">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

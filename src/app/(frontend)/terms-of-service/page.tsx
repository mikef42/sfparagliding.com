import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | SF Paragliding',
  description:
    'Terms of Service for SF Paragliding — tandem flights, paragliding lessons, equipment sales, and gift certificates.',
}

export default function TermsOfServicePage() {
  return (
    <div className="py-12 lg:py-16">
      <div className="container-narrow">
        <h1 className="section-heading text-2xl mb-2">Terms of Service</h1>
        <div className="section-divider" />
        <p className="text-sm text-gray-400 mb-10">Last updated: March 5, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-[15px] leading-relaxed text-gray-700">
          {/* 1. Agreement */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using the SF Paragliding website (sfparagliding.com), booking
              services, or purchasing products, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our website or services. We
              reserve the right to update these terms at any time, and continued use of the site
              constitutes acceptance of any modifications.
            </p>
          </section>

          {/* 2. Services */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              2. Description of Services
            </h2>
            <p>SF Paragliding offers the following services and products:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Tandem paragliding flights</li>
              <li>Paragliding lessons and training programs (P1 through P4)</li>
              <li>Gift certificates for flights, lessons, and merchandise</li>
              <li>Paragliding equipment, gear, and accessories</li>
            </ul>
            <p className="mt-3">
              All services are subject to weather conditions, instructor availability, and
              applicable safety regulations. SF Paragliding reserves the right to cancel, delay,
              or reschedule any flight or lesson due to unsafe weather, equipment concerns, or
              any other factor that could compromise participant safety.
            </p>
          </section>

          {/* 3. Booking & Payment */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              3. Booking &amp; Payment
            </h2>
            <p>
              All bookings are subject to availability. Payment is required at the time of
              booking or purchase. We accept major credit cards processed securely through
              Square.
            </p>
            <h3 className="font-heading text-base tracking-wide text-gray-800 mt-4 mb-2">
              Cancellation &amp; Refund Policy
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Tandem flights and lessons cancelled by the customer with at least 48 hours
                notice are eligible for a full refund or rescheduling at no additional cost.
              </li>
              <li>
                Cancellations with less than 48 hours notice may be subject to a cancellation
                fee of up to 50% of the booking amount.
              </li>
              <li>
                Flights or lessons cancelled by SF Paragliding due to weather or safety concerns
                will be rescheduled at no charge or refunded in full.
              </li>
              <li>
                Gift certificates are non-refundable but are transferable and do not expire.
              </li>
            </ul>
          </section>

          {/* 4. Assumption of Risk */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              4. Assumption of Risk &amp; Liability Waiver
            </h2>
            <p>
              Paragliding is an inherently risky activity. By participating in any SF
              Paragliding flight or lesson, you acknowledge and accept the risks involved,
              including but not limited to serious bodily injury, property damage, or death.
            </p>
            <p className="mt-3">
              All participants are required to sign a liability waiver and release form prior to
              any flight or lesson. Participants under 18 years of age must have a
              parent or legal guardian sign the waiver on their behalf. SF Paragliding, its
              instructors, and staff shall not be held liable for injuries or damages arising
              from participation in paragliding activities, except in cases of gross negligence
              or willful misconduct.
            </p>
          </section>

          {/* 5. Equipment Sales & Returns */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              5. Equipment Sales &amp; Returns
            </h2>
            <p>
              All equipment and product sales are final unless the item arrives defective or
              damaged. Defective or damaged items must be reported within 7 days of delivery.
              Returns of unused items in original packaging may be accepted at our discretion
              within 14 days of purchase, subject to a 15% restocking fee.
            </p>
            <p className="mt-3">
              Used equipment is sold as-is with no warranty. New equipment carries the
              manufacturer&apos;s warranty only. SF Paragliding does not provide additional
              warranties beyond those offered by the manufacturer.
            </p>
          </section>

          {/* 6. Health & Safety */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              6. Health &amp; Safety Requirements
            </h2>
            <p>
              Participants must be in reasonably good physical health to participate in
              paragliding activities. You must disclose any medical conditions, injuries, or
              disabilities that could affect your safety or the safety of others. SF Paragliding
              reserves the right to refuse service to anyone whose physical condition, behavior,
              or actions may compromise safety. Weight limits apply to tandem flights and will
              be communicated at the time of booking.
            </p>
          </section>

          {/* 7. User Accounts */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              7. User Accounts
            </h2>
            <p>
              If you create an account on our website, you are responsible for maintaining the
              confidentiality of your login credentials and for all activity under your account.
              You agree to notify us immediately of any unauthorized access to or use of your
              account.
            </p>
          </section>

          {/* 8. Intellectual Property */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              8. Intellectual Property
            </h2>
            <p>
              All content on this website, including text, images, logos, videos, graphics, and
              design, is the property of SF Paragliding or its content partners and is protected
              by applicable copyright and trademark laws. You may not reproduce, distribute, or
              use any content without prior written permission.
            </p>
          </section>

          {/* 9. Limitation of Liability */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              9. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, SF Paragliding shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, including but
              not limited to loss of profits, data, or goodwill, arising out of your use of our
              website or services. Our total liability for any claim shall not exceed the amount
              you paid for the specific service or product giving rise to the claim.
            </p>
          </section>

          {/* 10. Governing Law */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              10. Governing Law
            </h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws
              of the State of California, without regard to its conflict of law principles. Any
              disputes arising from these terms or your use of our services shall be resolved in
              the courts of San Mateo County, California.
            </p>
          </section>

          {/* 11. Changes */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              11. Changes to These Terms
            </h2>
            <p>
              We may revise these Terms of Service from time to time. Changes will be posted on
              this page with an updated &ldquo;Last updated&rdquo; date. Your continued use of
              the website after changes are posted constitutes your acceptance of the revised
              terms.
            </p>
          </section>

          {/* 12. Contact */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              12. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-none space-y-1 mt-2">
              <li>
                Email:{' '}
                <a
                  href="mailto:info@sfparagliding.com"
                  className="text-brand-amber hover:text-brand-amber-hover transition-colors"
                >
                  info@sfparagliding.com
                </a>
              </li>
              <li>Phone: (415) 555-1234</li>
              <li>Location: Pacifica, California</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | SF Paragliding',
  description:
    'Privacy Policy for SF Paragliding — how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 lg:py-16">
      <div className="container-narrow">
        <h1 className="section-heading text-2xl mb-2">Privacy Policy</h1>
        <div className="section-divider" />
        <p className="text-sm text-gray-400 mb-10">Last updated: March 5, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-[15px] leading-relaxed text-gray-700">
          {/* 1. Introduction */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              1. Introduction
            </h2>
            <p>
              SF Paragliding (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
              operates the website sfparagliding.com. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your personal information when you visit our
              website, book services, or purchase products. By using our website, you consent to
              the practices described in this policy.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              2. Information We Collect
            </h2>
            <h3 className="font-heading text-base tracking-wide text-gray-800 mt-4 mb-2">
              Information You Provide
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Name, email address, and phone number (when booking or contacting us)</li>
              <li>Billing and shipping address (for product orders)</li>
              <li>Payment information (processed securely through Square; see Section 4)</li>
              <li>Health and medical information relevant to flight safety (liability waivers)</li>
              <li>Account credentials if you create an account on our site</li>
              <li>Any other information you voluntarily provide through forms or correspondence</li>
            </ul>
            <h3 className="font-heading text-base tracking-wide text-gray-800 mt-4 mb-2">
              Information Collected Automatically
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>IP address, browser type, operating system, and device information</li>
              <li>Pages visited, time spent on pages, and referring URLs</li>
              <li>Cookies and similar tracking technologies (see Section 5)</li>
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Process bookings, orders, and payments</li>
              <li>Communicate with you about your bookings, orders, and inquiries</li>
              <li>Send promotional emails and newsletters (only with your consent)</li>
              <li>Improve our website, services, and customer experience</li>
              <li>Ensure participant safety and comply with legal requirements</li>
              <li>Prevent fraud and protect the security of our site</li>
              <li>Comply with applicable laws and regulations</li>
            </ul>
          </section>

          {/* 4. Payment Processing */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              4. Payment Processing &amp; PCI Compliance
            </h2>
            <p>
              All payments are processed securely through Square, Inc. When you make a purchase,
              your payment card information is sent directly to Square&apos;s servers and is
              never stored on our systems. Square is a PCI DSS Level 1 certified payment
              processor, the highest level of security certification available.
            </p>
            <p className="mt-3">
              We do not have access to your full credit card number, CVV, or other sensitive
              payment data. We only receive a payment confirmation and transaction reference
              from Square after a successful payment.
            </p>
          </section>

          {/* 5. Cookies */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              5. Cookies &amp; Tracking Technologies
            </h2>
            <p>
              We use cookies and similar technologies to enhance your browsing experience.
              Cookies are small data files stored on your device that help us remember your
              preferences and understand how you use our site.
            </p>
            <h3 className="font-heading text-base tracking-wide text-gray-800 mt-4 mb-2">
              Types of Cookies We Use
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Essential cookies:</strong> Required for the website to function
                properly (e.g., shopping cart, session management).
              </li>
              <li>
                <strong>Analytics cookies:</strong> Help us understand how visitors interact
                with our site to improve performance and content.
              </li>
              <li>
                <strong>Preference cookies:</strong> Remember your settings and preferences for
                a better experience.
              </li>
            </ul>
            <p className="mt-3">
              You can control cookie settings through your browser preferences. Disabling
              cookies may affect the functionality of certain features on our website.
            </p>
          </section>

          {/* 6. Data Sharing */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              6. Data Sharing &amp; Third Parties
            </h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may
              share your information with:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <strong>Square, Inc.:</strong> For secure payment processing.
              </li>
              <li>
                <strong>Email service providers:</strong> To send booking confirmations and
                newsletters (only if you opt in).
              </li>
              <li>
                <strong>Analytics providers:</strong> To help us understand website usage
                (data is aggregated and anonymized where possible).
              </li>
              <li>
                <strong>Legal authorities:</strong> When required by law, subpoena, or to
                protect our rights and safety.
              </li>
            </ul>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              7. Data Retention
            </h2>
            <p>
              We retain your personal information only for as long as necessary to fulfill the
              purposes described in this policy, comply with legal obligations, resolve
              disputes, and enforce our agreements. Order and transaction records are retained
              for a minimum of 7 years for tax and legal compliance purposes. You may request
              deletion of your personal data at any time (see Section 8).
            </p>
          </section>

          {/* 8. Your Rights (CCPA) */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              8. Your Privacy Rights (California Residents)
            </h2>
            <p>
              Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act
              (CPRA), California residents have specific rights regarding their personal
              information:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <strong>Right to Know:</strong> You can request details about the personal
                information we collect, use, and share.
              </li>
              <li>
                <strong>Right to Delete:</strong> You can request that we delete your personal
                information, subject to certain exceptions.
              </li>
              <li>
                <strong>Right to Correct:</strong> You can request that we correct inaccurate
                personal information.
              </li>
              <li>
                <strong>Right to Opt-Out:</strong> You can opt out of the sale or sharing of
                your personal information. Note: We do not sell personal information.
              </li>
              <li>
                <strong>Right to Non-Discrimination:</strong> We will not discriminate against
                you for exercising your privacy rights.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{' '}
              <a
                href="mailto:info@sfparagliding.com"
                className="text-brand-amber hover:text-brand-amber-hover transition-colors"
              >
                info@sfparagliding.com
              </a>
              . We will respond to verifiable requests within 45 days.
            </p>
          </section>

          {/* 9. Children's Privacy */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              9. Children&apos;s Privacy
            </h2>
            <p>
              Our website is not directed at children under the age of 13, and we do not
              knowingly collect personal information from children under 13. If we become aware
              that we have collected information from a child under 13, we will take steps to
              delete that information promptly. Minors between 13 and 18 may participate in
              paragliding services with parental consent and a signed waiver.
            </p>
          </section>

          {/* 10. Security */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              10. Data Security
            </h2>
            <p>
              We implement reasonable administrative, technical, and physical safeguards to
              protect your personal information from unauthorized access, use, alteration, and
              disclosure. Our website uses SSL/TLS encryption for all data transmission.
              However, no method of electronic transmission or storage is 100% secure, and we
              cannot guarantee absolute security.
            </p>
          </section>

          {/* 11. Changes */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              11. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on
              this page with an updated &ldquo;Last updated&rdquo; date. We encourage you to
              review this page periodically. Your continued use of our website after changes
              are posted constitutes your acceptance of the revised policy.
            </p>
          </section>

          {/* 12. Contact */}
          <section>
            <h2 className="font-heading text-lg tracking-wide text-gray-900 mb-3">
              12. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your privacy
              rights, please contact us:
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

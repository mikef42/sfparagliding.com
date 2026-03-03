import Link from 'next/link'
import { ReviewBadges } from './ReviewBadges'

export function StaticHomepage() {
  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[800px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url(https://cdn.shopify.com/s/files/1/0654/9177/3656/files/SFparagliding-mussel-rock_2048x2048.jpg)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />

        <div className="relative z-10 container-wide w-full text-center">
          <h1 className="text-6xl md:text-8xl lg:text-9xl text-white mb-4 animate-fade-up drop-shadow-lg">
            Fly Today !
          </h1>
          <div className="animate-fade-up animate-delay-200">
            <Link
              href="/services/tandem-flights"
              className="btn-primary text-base px-10 py-4 shadow-xl"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Review Badges ─── */}
      <ReviewBadges />

      {/* ─── Introduction Text ─── */}
      <section className="py-12 lg:py-16">
        <div className="container-narrow prose-content text-center text-gray-700">
          <p>
            Experience the beauty of the San Francisco Bay Area from a new
            perspective with SF Paragliding. We offer tandem paragliding flights
            and paragliding lessons year round. We&apos;re available 7 days a week
            and we have same-day booking for tandem flights. Our tandem pilots
            are some of the most experienced in the world, with a combined total
            of over 10,000 flights and a perfect safety record.{' '}
            <Link href="/services/tandem-flights">Come fly with us!</Link>
          </p>
          <p>
            Ready to become a solo pilot? SF Paragliding has got you covered. We
            offer USHPA certified instruction at various flying sites around the
            Bay Area. Our team of highly experienced instructors teach
            year-round. All instructors are certified by the USHPA and have
            thousands of hours of flying experience.{' '}
            <Link href="/services/paragliding-lessons">
              Sign up for lessons today!
            </Link>
          </p>
        </div>
      </section>

      {/* ─── Services Section ─── */}
      <section className="py-16 lg:py-20">
        <div className="container-wide">
          <h2 className="section-heading">Services</h2>
          <div className="section-divider" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tandem Flight */}
            <div className="group text-center">
              <div className="aspect-[4/3] overflow-hidden rounded-sm bg-gray-100 mb-5">
                <img
                  src="https://cdn.shopify.com/s/files/1/0654/9177/3656/files/tandemflight_480x480.jpg"
                  alt="Tandem paragliding flight over the coast"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-heading text-sm tracking-[0.2em] uppercase mb-3">
                Book a Tandem Flight
              </h3>
              <ul className="space-y-1.5 mb-5 text-sm text-gray-600 text-left max-w-[220px] mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-brand-amber font-bold">&#8226;</span>
                  Same day booking.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-amber font-bold">&#8226;</span>
                  Unlimited flight time
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-amber font-bold">&#8226;</span>
                  No age limit
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-amber font-bold">&#8226;</span>
                  Free Pictures
                </li>
              </ul>
              <Link href="/services/tandem-flights" className="btn-primary text-xs">
                Book Now
              </Link>
            </div>

            {/* Lessons */}
            <div className="group text-center">
              <div className="aspect-[4/3] overflow-hidden rounded-sm bg-gray-100 mb-5">
                <img
                  src="https://cdn.shopify.com/s/files/1/0654/9177/3656/files/lessons_480x480.jpg"
                  alt="Paragliding lessons at the coast"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-heading text-sm tracking-[0.2em] uppercase mb-3">
                Book Paragliding Lessons
              </h3>
              <p className="text-sm text-gray-600 mb-5 px-2">
                The greatest adventure of your lifetime begins here. After
                completing our USHPA certified pilot training course you will
                earn your P2 rating which allows you to fly at thousands of
                paragliding sights around the world.
              </p>
              <Link href="/services/paragliding-lessons" className="btn-primary text-xs">
                Sign Up Today!
              </Link>
            </div>

            {/* Gift Certificate */}
            <div className="group text-center">
              <div className="aspect-[4/3] overflow-hidden rounded-sm bg-gray-100 mb-5">
                <img
                  src="https://cdn.shopify.com/s/files/1/0654/9177/3656/files/gift-certificate_480x480.jpg"
                  alt="SF Paragliding Gift Certificate"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-heading text-sm tracking-[0.2em] uppercase mb-3">
                The Gift of Flight!
              </h3>
              <p className="text-sm text-gray-600 mb-5 px-2">
                Gift the gift of memories that last a lifetime. Our gift
                certificates are delivered electronically and never expire.
              </p>
              <Link href="/products/gift-certificate" className="btn-primary text-xs">
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials Section ─── */}
      <section className="py-16 lg:py-20 bg-brand-cream">
        <div className="container-wide">
          <h2 className="section-heading">Testimonials</h2>
          <div className="section-divider" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-sm p-6 lg:p-8 shadow-sm">
              <h3 className="font-heading text-sm tracking-[0.15em] uppercase mb-3">
                Worth Doing It All Over Again!
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                We arrived 5 mins early and Mike was there to greet us! This was
                my first time doing paragliding and I enjoyed every second of
                it. I was anxious about the take off and Mike put me at ease. It
                was a smooth take off! Loved being in the air and the views were
                breathtaking! Would definitely recommend paragliding here!!
                Worth doing it all over again!
              </p>
              <p className="text-sm font-medium text-gray-800">-Kavya Sibbala</p>
            </div>

            <div className="bg-white rounded-sm p-6 lg:p-8 shadow-sm">
              <h3 className="font-heading text-sm tracking-[0.15em] uppercase mb-3">
                Fantastic Time
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                I researched many of the paragliding companies and Mike was
                responsive and got back to me with lots of answers and respond
                quick. I came down from Mendocino County for my 60th birthday. I
                had a wonderful time. It was easy informative he was pleasant and
                very comfortable to be with. I can&apos;t wait to do it again.
              </p>
              <p className="text-sm font-medium text-gray-800">-whichwitch629</p>
            </div>

            <div className="bg-white rounded-sm p-6 lg:p-8 shadow-sm">
              <h3 className="font-heading text-sm tracking-[0.15em] uppercase mb-3">
                It Was Great!
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                I hope this review reaches the masses, lol. This was my first
                time ever doing something so bold as this, I must say it was a
                GREAT experience. The instructor was cool, knowledgeable and
                patient as I took my first flight. I highly recommend having
                your first flight with this company and team, you won&apos;t
                regret it. I will definitely be doing it again!!!
              </p>
              <p className="text-sm font-medium text-gray-800">-Atl_hunny</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

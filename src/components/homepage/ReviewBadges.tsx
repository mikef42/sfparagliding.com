export function ReviewBadges() {
  return (
    <section className="py-8 border-b border-gray-100">
      <div className="container-wide">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {/* Yelp */}
          <a
            href="https://www.yelp.com/biz/sf-paragliding-pacifica"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 group"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-6 h-6 text-[#d32323]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.986-4.378c.355-.52 1.04-.515 1.396.012a18.22 18.22 0 011.811 3.918c.168.45-.082.88-.497 1.042l.475-.397zM12.796 16.04c.96-.278 1.742.796 1.18 1.628l-2.982 4.38c-.356.52-1.04.516-1.398-.01a18.2 18.2 0 01-1.815-3.916c-.17-.45.08-.882.494-1.044l4.52-1.038zM6.626 12.16l4.994-1.432c.962-.276 1.742.798 1.178 1.63l-2.984 4.376c-.356.52-1.042.516-1.398-.01a18.2 18.2 0 01-1.81-3.918c-.17-.45.08-.88.494-1.042l-.474.396zM11.204 7.96c-.96.276-1.74-.798-1.178-1.63L12.708 1.95c.356-.52 1.042-.514 1.398.012a18.2 18.2 0 011.812 3.918c.168.45-.082.88-.496 1.042L11.204 7.96z" />
              </svg>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-[#d32323]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <span className="text-xs text-gray-500 group-hover:text-[#d32323] transition-colors">
              81 Reviews
            </span>
          </a>

          {/* Google */}
          <a
            href="https://www.google.com/maps/place/SF+Paragliding/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 group"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-[#FBBC05]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <span className="text-xs text-gray-500 group-hover:text-gray-800 transition-colors">
              550 Reviews
            </span>
          </a>

          {/* TripAdvisor */}
          <a
            href="https://www.tripadvisor.com/Attraction_Review-g32842-d17735498-Reviews-SF_Paragliding-Pacifica_California.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 group"
          >
            <div className="flex items-center gap-1.5">
              <svg className="w-5 h-5 text-[#00AF87]" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="6.5" cy="13.5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="17.5" cy="13.5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="6.5" cy="13.5" r="1" fill="currentColor" />
                <circle cx="17.5" cy="13.5" r="1" fill="currentColor" />
                <path d="M3 13.5C3 9.36 6.36 6 10.5 6h3c4.14 0 7.5 3.36 7.5 7.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M12 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border-2 ${
                      i <= 4
                        ? 'border-[#00AF87] bg-[#00AF87]'
                        : 'border-[#00AF87] bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-xs text-gray-500 group-hover:text-[#00AF87] transition-colors">
              31 Reviews
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}

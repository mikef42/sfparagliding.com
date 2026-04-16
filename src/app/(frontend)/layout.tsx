import type { Metadata } from 'next'
import '@/app/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { getSiteSettings } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'SF Paragliding',
  description:
    'Experience the beauty of the San Francisco Bay Area from a new perspective with SF Paragliding.',
}

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let logoScale = 90
  try {
    const settings = await getSiteSettings()
    logoScale = settings?.header?.logoScale ?? 90
  } catch (error) {
    console.error('[FrontendLayout] Error fetching site settings:', error)
    // Use default if settings fetch fails
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Recover from stale chunk errors after deployments */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var key='sfp-chunk-reload';
                window.addEventListener('error',function(e){
                  if(e.message&&(e.message.indexOf('Loading chunk')!==-1||e.message.indexOf('Loading CSS chunk')!==-1)){
                    var last=sessionStorage.getItem(key);
                    if(!last||Date.now()-parseInt(last,10)>15000){
                      sessionStorage.setItem(key,String(Date.now()));
                      window.location.reload();
                    }
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body>
        <Header logoScale={logoScale} />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  )
}

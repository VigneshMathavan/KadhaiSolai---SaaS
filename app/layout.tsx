import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'KadhaiSolai — Tamil Audio Books',
  description: 'Listen to Tamil novels narrated by AI. Upload your Tamil text, get a beautiful audio book.',
  keywords: ['Tamil audio books', 'Tamil novels', 'audio books Tamil Nadu'],
  openGraph: {
    title: 'KadhaiSolai',
    description: 'Tamil Audio Books powered by AI',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ta" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e1833',
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(201,168,76,0.2)',
              fontFamily: 'DM Sans',
              fontSize: '0.875rem',
            },
          }}
        />
      </body>
    </html>
  )
}

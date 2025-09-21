import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ArquiFI Lottery - Lotería Descentralizada',
  description: 'Compra tickets, rasca KoTickets y gana premios en KOKI. La primera lotería descentralizada en Farcaster.',
  keywords: ['lottery', 'gaming', 'blockchain', 'crypto', 'defi', 'arquifi', 'prizes', 'tickets'],
  authors: [{ name: 'ArquiFI Team' }],
  creator: 'ArquiFI',
  publisher: 'ArquiFI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://koqui-fi-lottery.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ArquiFI Lottery - Lotería Descentralizada',
    description: 'Compra tickets, rasca KoTickets y gana premios en KOKI. La primera lotería descentralizada en Farcaster.',
    url: 'https://koqui-fi-lottery.vercel.app',
    siteName: 'ArquiFI Lottery',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ArquiFI Lottery - Lotería Descentralizada',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArquiFI Lottery - Lotería Descentralizada',
    description: 'Compra tickets, rasca KoTickets y gana premios en KOKI. La primera lotería descentralizada en Farcaster.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a2e" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* Farcaster Mini App Meta Tags */}
        <meta name="fc:miniapp" content='{"version":"1","imageUrl":"https://res.cloudinary.com/dsqmynhve/image/upload/v1757544488/assets_task_01k4twvabmejhafj82yf0vbx2m_1757544407_img_1_cjpiug.webp","button":{"title":"🎰 Jugar Ahora","action":{"type":"launch_miniapp","url":"https://koqui-fi-lottery.vercel.app","name":"ArquiFI Lottery","splashImageUrl":"https://res.cloudinary.com/dsqmynhve/image/upload/v1757546123/20250910_1914_Pato_y_Tickets_Digitales_remix_01k4tydv7efdvbfh2zg6kcx8gx_kxavwj.png","splashBackgroundColor":"#1a1a2e"}}}' />
        <meta name="fc:frame" content='{"version":"1","imageUrl":"https://res.cloudinary.com/dsqmynhve/image/upload/v1757544488/assets_task_01k4twvabmejhafj82yf0vbx2m_1757544407_img_1_cjpiug.webp","button":{"title":"🎰 Jugar Ahora","action":{"type":"launch_frame","url":"https://koqui-fi-lottery.vercel.app","name":"ArquiFI Lottery","splashImageUrl":"https://res.cloudinary.com/dsqmynhve/image/upload/v1757546123/20250910_1914_Pato_y_Tickets_Digitales_remix_01k4tydv7efdvbfh2zg6kcx8gx_kxavwj.png","splashBackgroundColor":"#1a1a2e"}}}' />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
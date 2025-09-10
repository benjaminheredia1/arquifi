import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KokiFi Lottery - Lotería Descentralizada',
  description: 'Compra tickets, rasca KoTickets y gana premios en KOKI. La primera lotería descentralizada en Farcaster.',
  keywords: ['lottery', 'gaming', 'blockchain', 'crypto', 'defi', 'kokifi', 'prizes', 'tickets'],
  authors: [{ name: 'KokiFi Team' }],
  creator: 'KokiFi',
  publisher: 'KokiFi',
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
    title: 'KokiFi Lottery - Lotería Descentralizada',
    description: 'Compra tickets, rasca KoTickets y gana premios en KOKI. La primera lotería descentralizada en Farcaster.',
    url: 'https://koqui-fi-lottery.vercel.app',
    siteName: 'KokiFi Lottery',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KokiFi Lottery - Lotería Descentralizada',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KokiFi Lottery - Lotería Descentralizada',
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
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
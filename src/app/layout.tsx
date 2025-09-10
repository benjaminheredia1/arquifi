import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KoquiFI Lottery - Farcaster Frame',
  description: 'Decentralized lottery on Base Network with Farcaster integration',
  keywords: ['lottery', 'farcaster', 'base', 'blockchain', 'miniapp'],
  authors: [{ name: 'KoquiFI Team' }],
  openGraph: {
    title: 'KoquiFI Lottery',
    description: 'Decentralized lottery on Base Network',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KoquiFI Lottery',
    description: 'Decentralized lottery on Base Network',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

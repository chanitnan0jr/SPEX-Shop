import type { Metadata } from 'next'
import { Prompt, IBM_Plex_Sans_Thai } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { DashboardLayout } from '@/components/DashboardLayout'

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-prompt',
})

const ibmPlexThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-thai',
})

export const metadata: Metadata = {
  title: 'SpecBot',
  description: 'Thai smartphone comparison assistant with AI search and live spec exploration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${prompt.variable} ${ibmPlexThai.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${prompt.className} min-h-screen bg-(--surface) text-(--ink) antialiased selection:bg-sky-200 selection:text-slate-950`}
        suppressHydrationWarning
      >
        <Providers>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </Providers>
      </body>
    </html>
  )
}

import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { ReconProvider } from '@/lib/recon-store'
import { ThemeProvider } from '@/lib/theme-store'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ARGUS-FATE // CYBER OPERATIONS SUITE',
  description: 'Tactical cyber operations command & control console — OSINT, Threat Intel & Security Audit Suite',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark bg-background ${jetbrainsMono.variable}`}>
      <body className="antialiased font-mono">
        <ThemeProvider>
          <ReconProvider>
            {children}
          </ReconProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}


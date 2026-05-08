import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { UserProvider } from '@/lib/user-context'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'VitalAI - Non-Contact Vital Sign Monitoring',
  description: 'AI-powered non-contact vital sign monitoring system for real-time health tracking of heart rate, respiratory rate, and SpO2 levels.',
  generator: 'VitalAI',
  keywords: ['vital signs', 'health monitoring', 'AI', 'heart rate', 'SpO2', 'respiratory rate'],
  authors: [{ name: 'VitalAI Team' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}>
        <UserProvider>
          {children}
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            toastOptions={{
              style: {
                background: 'oklch(0.18 0.02 260 / 0.9)',
                border: '1px solid oklch(0.30 0.03 260 / 0.4)',
                backdropFilter: 'blur(20px)',
                color: 'oklch(0.97 0.01 260)',
              },
            }}
          />
          <Analytics />
        </UserProvider>
      </body>
    </html>
  )
}

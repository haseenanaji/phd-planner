import type { Metadata } from 'next'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'PhD Planner — Research Command Center',
  description: 'Your AI-powered research management platform for PhD students',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PhDPlanner',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#0a0f1e',
    'theme-color': '#f59e0b',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#f59e0b" />
      </head>
      <body className="min-h-screen bg-navy-900 antialiased">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}

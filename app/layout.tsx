import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PhD Planner — Research Command Center',
  description: 'Your AI-powered research management platform for PhD students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-navy-900 antialiased">
        {children}
      </body>
    </html>
  )
}

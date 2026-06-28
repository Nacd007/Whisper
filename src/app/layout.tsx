import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'WhisperLink — Anonymous Chat',
  description: 'Chat anonymously, share your location, discover nearby friends.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0ea5e9',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" toastOptions={{ style: { background: '#1a2535', border: '1px solid #2a3d52', color: '#f0f4f8' } }} />
      </body>
    </html>
  )
}

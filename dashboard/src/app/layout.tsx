import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BotNeroo0 Dashboard',
  description: 'Albion Online Event Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Linkary - Your Knowledge Library',
  description: 'Build your personal knowledge library through links',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}

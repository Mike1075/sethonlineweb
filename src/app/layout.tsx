import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '赛斯智慧 - 与高维意识对话',
  description: '跨越时空的智慧对话体验，深度探索意识、现实和存在的奥秘',
  keywords: ['赛斯', '智慧', '意识', '对话', 'AI', '哲学'],
  authors: [{ name: '赛斯智慧团队' }],
  creator: '赛斯智慧',
  publisher: '赛斯智慧',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: '赛斯智慧 - 与高维意识对话',
    description: '跨越时空的智慧对话体验，深度探索意识、现实和存在的奥秘',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: '赛斯智慧',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '赛斯智慧',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '赛斯智慧 - 与高维意识对话',
    description: '跨越时空的智慧对话体验，深度探索意识、现实和存在的奥秘',
    images: ['/og-image.jpg'],
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
    // 可以添加Google Search Console等验证码
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1f2640" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <div className="min-h-screen bg-steampunk-gradient">
            {children}
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgb(31, 38, 64)',
                color: 'rgb(241, 245, 249)',
                border: '1px solid rgba(166, 115, 64, 0.3)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
import AppSidebar from '@/components/app-sidebar'
import ArtifactRoot from '@/components/artifact/artifact-root'
import Header from '@/components/header'
import WrappedPrivyProvider from '@/components/privy-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { privy } from '@/lib/privy/verify-access-token'
import { cn } from '@/lib/utils'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'Jarvis'
const description = 'Autonomous AI that opens investing to all.'

export const metadata: Metadata = {
  metadataBase: new URL('https://jarvis-investment-agent.onrender.com'),
  title,
  description,
  openGraph: {
    title,
    description
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: '@frfrcrypto'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookiesList = await cookies()
  const privyToken = cookiesList.get('privy-token')?.value

  let authenticated = false
  if (privyToken) {
    try {
      const verifiedClaims = await privy.verifyAuthToken(privyToken)
      authenticated = true
    } catch (error) {
      console.error('Failed to verify auth token:', error)
    }
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen flex flex-col font-sans antialiased',
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WrappedPrivyProvider>
            <SidebarProvider defaultOpen={false}>
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <Header />
                <main className="flex flex-1 min-h-0">
                  <ArtifactRoot>{children}</ArtifactRoot>
                </main>
              </div>
            </SidebarProvider>
          </WrappedPrivyProvider>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

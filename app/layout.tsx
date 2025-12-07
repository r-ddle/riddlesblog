import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono, Source_Serif_4, Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"

// Initialize fonts
const _geist = V0_Font_Geist({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"] })

export const metadata: Metadata = {
  title: "riddle's ventlog",
  description:
    "I work a 9-5, play games that fit my vibe and love to code. Wait did I forget to mention I game?",
  icons: {
    icon: "https://github.com/r-ddle.png",
  },
  openGraph: {
    title: "riddle's ventlog",
    description:
      "I work a 9-5, play games that fit my vibe and love to code. Wait did I forget to mention I game?",
    url: "https://blog.r-ddle.dev",
    siteName: "riddle's ventlog",
    images: [
      {
        url: "https://i.imgur.com/kwHJp29.gif",
        width: 1200,
        height: 630,
        alt: "riddle's ventlog banner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "riddle's ventlog",
    description:
      "I work a 9-5, play games that fit my vibe and love to code. Wait did I forget to mention I game?",
    images: ["https://i.imgur.com/kwHJp29.gif"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

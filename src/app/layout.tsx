import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Arcade Royale",
  description: "Classic arcade games reimagined for the modern web. Compete with players worldwide.",
  keywords: ["arcade", "games", "snake", "flappy bird", "typing", "reaction", "t-rex", "leaderboard"],
  authors: [{ name: "Arcade Royale" }],
  openGraph: {
    title: "Arcade Royale",
    description: "Classic arcade games reimagined for the modern web",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arcade Royale",
    description: "Classic arcade games reimagined for the modern web",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

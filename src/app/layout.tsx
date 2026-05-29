import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreInitializer from "@/components/StoreInitializer";
import Navigation from "@/components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Prode Mundial 2026",
  description: "El torneo familiar más importante del planeta.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Prode 2026",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-sports-bg text-stone-900">
        <StoreInitializer>
          <Navigation />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-24 pb-24 md:pb-12 relative z-10">
            {children}
          </main>
        </StoreInitializer>
      </body>
    </html>
  );
}

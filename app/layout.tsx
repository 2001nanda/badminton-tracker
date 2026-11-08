import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DesktopNavigation, MobileNavigation, MobileTopBar } from "@/components/Navigation";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { DeleteProtectionProvider } from "@/lib/contexts/DeleteProtectionContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Badminton Tracker - Court Champions",
  description: "Track badminton matches, compete with friends, and climb the rankings",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Badminton Tracker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} bg-[#0B0F14] text-white antialiased`}>
        <ThemeProvider>
          <DeleteProtectionProvider>
            <MobileTopBar />
            <DesktopNavigation />
            <main className="min-h-screen pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-8">
              {children}
            </main>
            <MobileNavigation />
            <Toaster />
            <PWAInstallPrompt />
          </DeleteProtectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

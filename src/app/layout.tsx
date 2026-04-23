import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./animate.css";
import StoreProvider from "@/contexts/StoreProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import SeviceWorker from "@/common/serviceWorker/SeviceWorker";
import type { Metadata } from "next";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = { /* keep your metadata here */ };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="rtl">
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="My Tasks" />
      <link rel="apple-touch-icon" href="/web-app-manifest-192x192.png" />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SeviceWorker />
        <StoreProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
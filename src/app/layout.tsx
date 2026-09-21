import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./animate.css";
import StoreProvider from "@/contexts/StoreProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import SeviceWorker from "@/common/serviceWorker/SeviceWorker";
import type { Metadata, Viewport } from "next";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Weekly Tasks",
  description: "My Weekly Tasks",
  applicationName: "My Weekly Tasks",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Weekly Tasks",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
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
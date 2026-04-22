
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./animate.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

import StoreProvider from "@/contexts/StoreProvider";
import Navbar from "@/common/NavBar/NavBar";
import SeviceWorker from "@/common/serviceWorker/SeviceWorker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


import type { Metadata } from "next";
import PushNotificationManager from "@/common/Notifications";
import InstallPWA from "@/common/DownloadButtonPwa";
import Footer from "@/common/Footer";
import WelcomeNotifications from "@/features/Notifications/WelcomeNotifications";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "Just Today | Manage Your Weekly Tasks",
    template: "%s | Just Today",
  },
  description: "أفضل تطبيق لتنظيم مهامك الأسبوعية، تتبع إنجازاتك، وتحسين إنتاجيتك بكل سهولة.",
  keywords: ["تاسكات", "تنظيم وقت", "مهام أسبوعية", "Task manager", "Weekly planner", "Productivity app"],
  authors: [{ name: "Youssef Mahmoud" }],

  // إعدادات الـ Open Graph (تظهر عند مشاركة اللينك على فيسبوك/واتساب)
  openGraph: {
    title: "Just Today -  نظم حياتك بذكاء وسهولة",
    description: "تطبيق ذكي لإدارة المهام وتتبع الأهداف الأسبوعية مع ميزة الأرشفة التلقائية.",
    url: "https://my-tasks-inky.vercel.app",
    siteName: "Just Today",
    locale: "ar_EG",
    type: "website",
  },

  // إعدادات تويتر
  twitter: {
    card: "summary_large_image",
    title: "Just Today",
    description: "نظم مهامك الأسبوعية ولا تفوت أي هدف.",
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl">
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="My Tasks" />
      <link rel="apple-touch-icon" href="/web-app-manifest-192x192.png" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SeviceWorker />
        <StoreProvider>
          <ThemeProvider>
            <AuthProvider>
              <Navbar />
              <PushNotificationManager />
              <InstallPWA />
              <Suspense fallback={<Loader2 className="animate-spin h-8 w-8" />}>
                <WelcomeNotifications />
              </Suspense>
              {children}
            </AuthProvider >
          </ThemeProvider >
        </StoreProvider >
        <div className="mt-6 text-center text-muted text-lg">
          <p>📅 Weekly tasks automatically reset every Saturday</p>
        </div>


        <Footer />
      </body >
    </html >
  );
}

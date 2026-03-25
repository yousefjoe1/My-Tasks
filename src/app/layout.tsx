
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
import { Mail, Phone } from "lucide-react";
// import PushNotificationManager from "@/common/PushNotifications";
import PushNotificationManager from "@/common/Notifications";

export const metadata: Metadata = {
  title: {
    default: "Weekly Tasks | Manage Your Weekly Tasks",
    template: "%s | Weekly Tasks",
  },
  description: "أفضل تطبيق لتنظيم مهامك الأسبوعية، تتبع إنجازاتك، وتحسين إنتاجيتك بكل سهولة.",
  keywords: ["تاسكات", "تنظيم وقت", "مهام أسبوعية", "Task manager", "Weekly planner", "Productivity app"],
  authors: [{ name: "Youssef Mahmoud" }],

  // إعدادات الـ Open Graph (تظهر عند مشاركة اللينك على فيسبوك/واتساب)
  openGraph: {
    title: "Weekly Tasks - نظم حياتك بذكاء",
    description: "تطبيق ذكي لإدارة المهام وتتبع الأهداف الأسبوعية مع ميزة الأرشفة التلقائية.",
    url: "https://my-tasks-inky.vercel.app",
    siteName: "Weekly Tasks",
    locale: "ar_EG",
    type: "website",
  },

  // إعدادات تويتر
  twitter: {
    card: "summary_large_image",
    title: "Weekly Tasks",
    description: "نظم مهامك الأسبوعية ولا تفوت أي هدف.",
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // useEffect(() => {
  //   if ("serviceWorker" in navigator) {
  //     window.addEventListener("load", () => {
  //       navigator.serviceWorker
  //         .register("/sw.js")
  //         .then((registration) => console.log("SW registered: ", registration))
  //         .catch((registrationError) => console.log("SW registration failed: ", registrationError));
  //     });
  //   }
  // }, []);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SeviceWorker />
        <StoreProvider>
          <ThemeProvider>
            <AuthProvider>
              <Navbar />
              <PushNotificationManager />
              {children}
            </AuthProvider >
          </ThemeProvider >
        </StoreProvider >
        <div className="mt-6 text-center text-muted text-lg">
          <p>📅 Weekly tasks automatically reset every Monday</p>
          <p className="mt-1">💾 Data is saved locally in your browser and synced to cloud after you login</p>
        </div>


        {/* My information developed by*/}
        <section className='mt-y p-4 flex flex-col gap-4 text-center text-muted text-lg'>
          <h4>Developed By: <b>Youssef Mahmoud</b> </h4>
          <a className='flex items-center justify-center gap-2' href="mailto:yousefmahmoud150@gmail.com">Email: yousefmahmoud150@gmail.com <Mail /> </a>
          <a className='flex items-center justify-center gap-2' href="https://wa.me/201554464169">Whats App: 01554464169 <Phone /> </a>
        </section>
      </body >
    </html >
  );
}

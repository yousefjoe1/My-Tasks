
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

              {children}
            </AuthProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

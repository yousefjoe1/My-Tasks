import Navbar from "@/common/NavBar/NavBar";
import PushNotificationManager from "@/common/Notifications";
import InstallPWA from "@/common/DownloadButtonPwa";
import Footer from "@/common/Footer";
import WelcomeNotifications from "@/features/Notifications/WelcomeNotifications";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="mt-12 flex flex-wrap items-center justify-center gap-2 border-b border-primary bg-secondary px-3 py-2 shadow-sm">
        <PushNotificationManager />
        <InstallPWA />
      </div>
      <Suspense fallback={<Loader2 className="animate-spin h-8 w-8" />}>
        <WelcomeNotifications />
      </Suspense>
      {children}
      <div className="mt-6 text-center text-muted text-lg">
        <p>📅 Weekly tasks automatically reset every Saturday</p>
      </div>
      <Footer />
    </>
  );
}
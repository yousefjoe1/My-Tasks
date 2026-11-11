'use client'
import { useRef, useState, useEffect, Suspense } from "react";
import { BarChart3, BookOpen, Dumbbell, Languages, LoaderIcon, LogIn, LogOut, Moon, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import LoginModal from "../Modals/LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase/client";
import { LocalStorageStrategy } from "@/lib/storage/weeklyTasks/LocalStorageStrategy";
import { useToast } from "@/components/Toasts/useToast";
import { usePathname, useSearchParams } from "next/navigation";

const navLinks = [
  { name: "معلومات التقدم", href: "/dashboard", icon: BarChart3 },
  { name: "ذكر بسيط", href: "/group-tasks", icon: BookOpen },
  { name: "صحتك", href: "/health", icon: Dumbbell },
  { name: "نومك", href: "/sleep", icon: Moon },
  // { name: "درس ألماني", href: "/german-lesson", icon: Languages },
];

export default function Navbar() {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { error } = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
        setShowLogoutConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signOut();
      localStorage.removeItem('sb-atfsfrwxmhrzlvmwxayi-auth-token');

      if (err) {
        error(err.message);
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("Logout error details:", err);
    } finally {
      LocalStorageStrategy.resetSync();
      localStorage.removeItem('supabase.auth.token');
      setLoading(false);
      setShowLogoutConfirm(false);
      setSettingsOpen(false);
    }
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <nav className="fixed w-full top-0 z-50 bg-primary border-b border-primary shadow-sm">
        <div className="container mx-auto px-4">
          <div className="relative flex h-16 items-center justify-between">
            <div className="relative z-10 shrink-0">
              <Link href="/" className="text-2xl font-bold text-brand hover:opacity-80 transition-opacity">
                كل يوم
              </Link>
            </div>

            <div
              role="group"
              aria-label="تنقل سريع"
              className="pointer-events-none absolute inset-x-0 z-10 flex items-center justify-center gap-1 px-16 sm:gap-2"
            >
              {navLinks.map(({ name, href, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-label={name}
                    aria-current={active ? "page" : undefined}
                    title={name}
                    className={`btn btn-icon pointer-events-auto ${active ? "is-active" : ""}`}
                  >
                    <Icon className="size-5" aria-hidden />
                  </Link>
                );
              })}
            </div>

            <div className="relative z-10" ref={settingsRef}>
              {authLoading ? (
                <LoaderIcon className="animate-spin h-6 w-6 text-primary" />
              ) : (
                <>
                  <button
                    type="button"
                    title="الإعدادات"
                    aria-expanded={settingsOpen}
                    aria-haspopup="menu"
                    className={`btn btn-icon ${settingsOpen ? "is-active" : ""}`}
                    onClick={() => {
                      setSettingsOpen((open) => !open);
                      setShowLogoutConfirm(false);
                    }}
                  >
                    <Settings className="h-5 w-5" />
                  </button>

                  {settingsOpen && (
                    <div
                      role="menu"
                      className="absolute left-0 mt-3 w-56 glass-card border-brand-primary p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50"
                    >
                      <p className="text-xs text-primary font-bold mb-3 text-center">المظهر</p>
                      <div className="flex justify-center gap-2 mb-4">
                        <button
                          type="button"
                          title="وردي"
                          onClick={() => toggleTheme('pink')}
                          className={`btn btn-icon overflow-hidden p-0 ${theme === "pink" ? "is-active" : ""}`}
                        >
                          <Image height={44} width={44} alt="وردي" src="/icons/pink-img.png" className="w-full h-full object-cover" />
                        </button>
                        <button
                          type="button"
                          title="فاتح"
                          onClick={() => toggleTheme('light')}
                          className={`btn btn-icon ${theme === "light" ? "is-active" : ""}`}
                        >
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="داكن"
                          onClick={() => toggleTheme('dark')}
                          className={`btn btn-icon ${theme === "dark" ? "is-active" : ""}`}
                        >
                          <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </button>
                      </div>

                      {user == null ? (
                        <button
                          type="button"
                          title="Log in"
                          className="btn btn-secondary w-full"
                          onClick={() => {
                            closeSettings();
                            dialogRef.current?.showModal();
                          }}
                        >
                          <LogIn className="h-4 w-4" />
                          تسجيل الدخول
                        </button>
                      ) : showLogoutConfirm ? (
                        <div className="space-y-2">
                          <p className="text-xs text-primary font-bold text-center italic">هل تريد تسجيل الخروج؟</p>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={handleLogout}
                            className="btn btn-danger-solid w-full text-xs"
                          >
                            {loading ? <LoaderIcon className="animate-spin h-3 w-3" /> : "نعم، خروج"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowLogoutConfirm(false)}
                            className="btn btn-ghost w-full text-xs"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          title="Logout"
                          className="btn btn-secondary w-full"
                          onClick={() => setShowLogoutConfirm(true)}
                        >
                          <LogOut className="h-4 w-4" />
                          تسجيل الخروج
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <dialog ref={dialogRef} className="fixed w-[95%] bg-transparent transform  z-50 outline-none backdrop:bg-black/40 backdrop:backdrop-blur-sm">
        <div className="flex flex-col gap-3">
          <Suspense fallback={<div>Loading...</div>}>
            <LoginModalWrapper closeModal={() => dialogRef?.current?.close()} />
          </Suspense>
          <button
            className="btn btn-danger w-full"
            onClick={() => dialogRef?.current?.close()}
          >
            إغلاق
          </button>
        </div>
      </dialog>
    </>
  );
}

function LoginModalWrapper({ closeModal }: { closeModal: () => void }) {
  const searchParams = useSearchParams();
  const referredByQuery = searchParams.get('ref');

  return <LoginModal referredByQuery={referredByQuery} closeModal={closeModal} />;
}

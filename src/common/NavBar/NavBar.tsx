'use client'
import { useRef, useState, useEffect, Suspense } from "react";
import { LoaderIcon, LogIn, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import ToggleMode from "./ToggleMode";
import LoginModal from "../Modals/LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { LocalStorageStrategy } from "@/lib/storage/weeklyTasks/LocalStorageStrategy";
import { useToast } from "@/components/Toasts/useToast";
import { usePathname, useSearchParams } from "next/navigation";
import { getUserRoleById } from "@/features/admin-dashboard/actions/admin_actions";

const navLinks = [
  { name: "مهمات بسيطه", href: "/general-tasks" },
  { name: "انجازاتي", href: "/dashboard" },
  { name: "النهارده أقوي ⚡", href: "/" },
];

export default function Navbar() {
  const { user, loading: authLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // حالة إظهار التأكيد
  const { error } = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null); // للتعامل مع الإغلاق عند الضغط بره
  const [loading, setLoading] = useState(false);

  const path = usePathname();

  const [userInfo, setUserInfo] = useState(null);
  console.log("🚀 ~ Navbar ~ userInfo:", userInfo)

  const getUser = async () => {
    if (user) {
      try {
        const res = await getUserRoleById(user.id);
        setUserInfo(res);
        console.log("🚀 ~ Navbar ~ res:", res)
      } catch (error) {

      }
    }
  }

  useEffect(() => {
    getUser();
  }, [user]);


  // إغلاق قائمة التأكيد لو ضغطت في أي مكان بره
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (confirmRef.current && !confirmRef.current.contains(event.target as Node)) {
        setShowConfirm(false);
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
      setShowConfirm(false);
    }
  };

  return (
    <>
      <nav className="fixed w-full top-0 z-50 bg-primary border-b border-primary shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="shrink-0">
              <Link href="/" className={`text-2xl font-bold text-brand hover:opacity-80 transition-opacity`}>
                Just Today
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-primary hover:text-brand font-medium transition-colors duration-200 relative group ${path === link.href ? "text-brand border-b-2 border rounded-2xl px-2" : ""}`}
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-200 group-hover:w-full"></span>
                </Link>
              ))}
              {
                userInfo == 'admin' && (
                  <Link
                    href="/admin"
                    className={`text-primary hover:text-brand font-medium transition-colors duration-200 relative group ${path === "/admin" ? "text-brand border-b-2 border rounded-2xl px-2" : ""}`}
                  >
                    لوحة التحكم
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-200 group-hover:w-full"></span>
                  </Link>
                )
              }
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-primary hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <div className="space-x-4 flex items-center relative">
              <ToggleMode />

              {authLoading ? (
                <LoaderIcon className="animate-spin" />
              ) : (
                <>
                  {user == null ? (
                    <button
                      title="Log in"
                      className="p-3 rounded-full bg-secondary hover:bg-tertiary transition-colors shadow-lg border border-primary"
                      onClick={() => dialogRef?.current?.showModal()}
                    >
                      <LogIn />
                    </button>
                  ) : (
                    <div className="relative" ref={confirmRef}>
                      <button
                        title="Logout"
                        className={`p-3 rounded-full transition-colors shadow-lg border border-primary ${showConfirm ? 'bg-tertiary border-brand' : 'bg-secondary hover:bg-tertiary'
                          }`}
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        <LogOut />
                      </button>

                      {/* ديف التأكيد الصغير */}
                      {showConfirm && (
                        <div className="absolute left-0 mt-3 w-48 glass-card border-brand-primary p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50">
                          <p className="text-xs text-primary font-bold mb-3 text-center italic">هل تريد تسجيل الخروج؟</p>
                          <div className="flex flex-col gap-2">
                            <button
                              disabled={loading}
                              onClick={handleLogout}
                              className="w-full py-2 bg-brand-error/10 text-brand-error hover:bg-brand-error hover:text-white rounded-lg text-xs font-black transition-all flex justify-center items-center gap-2"
                            >
                              {loading ? <LoaderIcon className="animate-spin h-3 w-3" /> : "نعم، خروج"}
                            </button>
                            <button
                              onClick={() => setShowConfirm(false)}
                              className="w-full py-2 bg-tertiary text-primary hover:bg-secondary rounded-lg text-xs font-medium transition-all"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 text-primary hover:bg-secondary hover:text-brand rounded-lg font-medium transition-colors ${path === link.href ? "text-brand border-2 border-primary rounded-2xl px-2" : ""}`}
                >
                  {link.name}
                </Link>
              ))}
              {
                userInfo == 'admin' && (
                  <Link
                    href="/admin"
                    className={`text-primary px-4 py-3 hover:text-brand font-medium transition-colors duration-200 relative group ${path === "/admin" ? "text-brand border-b-2 border rounded-2xl px-2" : ""}`}
                  >
                    لوحة التحكم
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-200 group-hover:w-full"></span>
                  </Link>
                )
              }
            </div>
          )}
        </div>
      </nav>

      {/* html dialog */}
      <dialog ref={dialogRef} className="fixed w-[95%] bg-transparent transform  z-50 outline-none backdrop:bg-black/40 backdrop:backdrop-blur-sm">
        <div className="flex flex-col gap-3">
          <Suspense fallback={<div>Loading...</div>}>
            <LoginModalWrapper closeModal={() => dialogRef?.current?.close()} />
          </Suspense>
          <button
            className="p-3 rounded-2xl w-full text-brand-error bg-secondary hover:bg-brand-error/10 transition-colors shadow-lg border border-primary font-bold"
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
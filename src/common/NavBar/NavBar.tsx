'use client'
import { useRef, useState } from "react";
import { LoaderIcon, LogIn, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import ToggleMode from "./ToggleMode";
import LoginModal from "../Modals/LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { fromSupabaseBlock, supabase } from "@/lib/supabase/client";
import { LocalStorageStrategy } from "@/lib/storage/weeklyTasks/LocalStorageStrategy";

const navLinks = [
  { name: "Main", href: "/" },
  { name: "My Productivity", href: "/dashboard" },
];

export default function Navbar() {
  const { user, loading: authLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const [loading, setLoading] = useState(false);


  const handleLogout = async () => {
    setLoading(true);
    if (user != null) {
      try {
        const { data: cloudBlocks, error } = await supabase
          .from('weekly_tasks')
          .select('*')
          .eq('userId', user.id);

        if (!error && cloudBlocks) {
          const localFormatBlocks = cloudBlocks.map(block => fromSupabaseBlock(block));
          LocalStorageStrategy.saveAllData(localFormatBlocks);
          LocalStorageStrategy.resetSync();
        }

        await supabase.auth.signOut();
      } catch (err) {
        console.error("Error during logout sync:", err);
      } finally {
        setLoading(false);
      }
    }
  };


  return (
    <>
      <nav className="fixed w-full top-0 z-50 bg-primary border-b border-primary shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="shrink-0">
              <Link
                href="/"
                className="text-2xl font-bold text-brand hover:opacity-80 transition-opacity"
              >
                Productivity
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-primary hover:text-brand font-medium transition-colors duration-200 relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-200 group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-primary hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <div className="space-x-4 flex items-center">
              <ToggleMode />

              {
                authLoading ? <LoaderIcon className="animate-spin" /> :
                  <>
                    {
                      user == null ?
                        <button
                          title="Log in"
                          className=" p-3 rounded-full bg-secondary hover:bg-tertiary transition-colors shadow-lg border border-primary"

                          onClick={() => dialogRef?.current?.showModal()}>
                          <LogIn />
                        </button>
                        :
                        <button
                          title="Logout"
                          disabled={loading}
                          className="p-3 rounded-full bg-secondary hover:bg-tertiary transition-colors shadow-lg border border-primary"

                          onClick={handleLogout}>

                          {loading ? <LoaderIcon className="animate-spin" /> : <LogOut className="" />}
                        </button>

                    }
                  </>
              }

            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-primary hover:bg-secondary hover:text-brand rounded-lg font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>


      {/* html dialog */}

      <dialog ref={dialogRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-brand-bg">
        <LoginModal />
        <button
          className="p-3 rounded-full w-full text-brand-text bg-secondary hover:bg-tertiary transition-colors shadow-lg border border-primary"
          onClick={() => dialogRef?.current?.close()}>Close</button>
      </dialog>

    </>
  );
}

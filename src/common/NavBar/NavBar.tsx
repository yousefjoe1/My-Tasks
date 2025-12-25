import { useRef, useState } from "react";
import { LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import ToggleMode from "./ToggleMode";
import LoginModal from "../Modals/LoginModal";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const navLinks = [
    { name: "Main", href: "/" },
    { name: "Todos", href: "/todos" },
    { name: "Notes", href: "/notes" },
    { name: "My Productivity", href: "/productivity" },
  ];

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
            <ToggleMode />
            <button onClick={() => dialogRef?.current?.showModal()}>
              <LogIn />
            </button>
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

      <dialog ref={dialogRef} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-primary backdrop:blur-sm">
        <LoginModal />
      </dialog>

    </>
  );
}

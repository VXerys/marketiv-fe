"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Logo } from "@/assets/images";
import { cn } from "@/lib/utils";
import { NAVBAR_CONTENT } from "@/data/content";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navLinks = NAVBAR_CONTENT.links;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 32);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none">
      <nav
        className={cn(
          "transition-all duration-300 ease-in-out pointer-events-auto",
          isScrolled
            ? "w-full bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-neutral-200/80 shadow-sm rounded-none mt-0"
            : "w-full max-w-5xl bg-white/40 backdrop-blur-xl backdrop-saturate-150 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full mt-4 mx-4 md:mx-6",
          isMobileMenuOpen && "bg-white rounded-none mt-0 max-w-full mx-0"
        )}
      >
        <div className={cn(
          "mx-auto flex w-full items-center",
          isScrolled ? "max-w-7xl px-6 py-4 md:px-12 lg:px-16" : "px-6 py-3 lg:px-8"
        )}>
          {/* Logo */}
          <div className="flex-1 flex items-center">
            <Link href="/" className="inline-flex items-center shrink-0 cursor-pointer">
              <Logo
                className="h-9 w-auto transition-all duration-300"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <ul className="hidden items-center gap-8 md:flex lg:gap-10">
            {navLinks.map((link: { label: string; href: string }) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-semibold tracking-wide text-neutral-600 hover:text-primary-600 transition-colors duration-200 cursor-pointer"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
            <Link
              href="/login"
              id="navbar-login"
              className="text-sm font-semibold text-neutral-600 hover:text-primary-600 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-primary-50 cursor-pointer"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              id="navbar-register"
              className="inline-flex items-center justify-center rounded-full bg-primary-500 px-6 py-2 text-sm font-bold text-white shadow-sm shadow-primary-500/30 transition-all duration-200 hover:bg-primary-600 hover:scale-105 cursor-pointer"
            >
              Daftar
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className={cn(
              "flex cursor-pointer flex-col gap-1.5 p-2 md:hidden ml-2 cursor-pointer",
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span
              className={cn(
                "h-0.5 w-6 transition-all duration-300 bg-neutral-700",
                isMobileMenuOpen && "translate-y-2 rotate-45"
              )}
            />
            <span
              className={cn(
                "h-0.5 w-6 transition-all duration-300 bg-neutral-700",
                isMobileMenuOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "h-0.5 w-6 transition-all duration-300 bg-neutral-700",
                isMobileMenuOpen && "-translate-y-2 -rotate-45"
              )}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 md:hidden bg-white border-t border-neutral-100",
          isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="flex flex-col items-center gap-4 pt-4 pb-6">
          {navLinks.map((link: { label: string; href: string }) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-semibold text-neutral-700 transition-colors hover:text-primary-600 cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="w-full px-6 flex flex-col gap-3 mt-2 pt-3 border-t border-neutral-100">
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white py-3 text-sm font-bold text-neutral-700 hover:border-primary-300 hover:text-primary-600 transition-all cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-xl bg-primary-500 py-3 text-sm font-bold text-white shadow shadow-primary-200 hover:bg-primary-600 transition-colors cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Daftar Sekarang
            </Link>
          </li>
        </ul>
      </div>
      </nav>
    </div>
  );
}
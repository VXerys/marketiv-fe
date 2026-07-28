"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/assets/images";
import { cn } from "@/lib/utils";
import { NAVBAR_CONTENT } from "@/data/content";
import { routes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = NAVBAR_CONTENT.links;

  return (
    <nav
      className={cn(
        "absolute inset-x-0 top-0 z-50 w-full transition-colors duration-300",
        isMobileMenuOpen
          ? "bg-brand-dark/95 backdrop-blur-md md:bg-transparent md:backdrop-blur-none"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center px-6 py-6 md:px-12 md:py-10 lg:px-16">
        {/* Logo (left-aligned) */}
        <div className="flex-1">
          <Link href="/" className="inline-block shrink-0">
            <Logo className="h-8 w-auto md:h-10" />
          </Link>
        </div>

        {/* Desktop Navigation Links (centered) */}
        <ul className="hidden items-center gap-12 md:flex lg:gap-20">
          {navLinks.map((link: { label: string; href: string }) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-nav-link text-white/90 transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side: CTA auth (desktop) + toggle (mobile) */}
        <div className="flex flex-1 justify-end items-center gap-4">
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href={routes.login}
              className="text-nav-link rounded-xl px-4 py-2 text-white/90 transition-colors duration-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              {NAVBAR_CONTENT.cta.masuk}
            </Link>
            <Button variant="primary" size="md" href={routes.register}>
              {NAVBAR_CONTENT.cta.daftar}
            </Button>
          </div>

          <button
            className="flex cursor-pointer flex-col gap-1.5 p-2 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span
              className={cn(
                "h-0.5 w-6 bg-white transition-all duration-300",
                isMobileMenuOpen && "translate-y-2 rotate-45"
              )}
            />
            <span
              className={cn(
                "h-0.5 w-6 bg-white transition-all duration-300",
                isMobileMenuOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "h-0.5 w-6 bg-white transition-all duration-300",
                isMobileMenuOpen && "-translate-y-2 -rotate-45"
              )}
            />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 md:hidden",
          isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="flex flex-col items-center gap-5 pt-2 pb-8">
          {navLinks.map((link: { label: string; href: string }) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-white/90 transition-colors duration-200 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="w-full px-6 flex flex-col gap-3 mt-2">
            <Link
              href={routes.login}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex min-h-[44px] w-full items-center justify-center rounded-md text-sm font-medium text-white/90 transition-colors duration-200 hover:text-white"
            >
              {NAVBAR_CONTENT.cta.masuk}
            </Link>
            <Button className="w-full flex justify-center py-3.5" variant="soft" size="md" href={routes.registerWithRole("creator")} onClick={() => setIsMobileMenuOpen(false)}>
              {NAVBAR_CONTENT.cta.daftarKreator}
            </Button>
            <Button className="w-full flex justify-center py-3.5" variant="primary" size="md" href={routes.registerWithRole("umkm")} onClick={() => setIsMobileMenuOpen(false)}>
              {NAVBAR_CONTENT.cta.daftarUmkm}
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
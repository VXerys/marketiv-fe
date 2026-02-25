"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/assets/images";
import { cn } from "@/lib/utils";
import { NAVBAR_CONTENT } from "@/data/content";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = NAVBAR_CONTENT.links;

  return (
    <nav className="absolute inset-x-0 top-0 z-50 w-full">
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
                className="text-white/90 transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side CTA / Mobile Toggle */}
        <div className="flex flex-1 justify-end items-center gap-4">
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="soft" size="sm" href="/creator" className="px-6">
              CREATOR
            </Button>
            <Button variant="primary" size="sm" href="/umkm" className="px-6">
              UMKM
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
          "bg-brand-dark/95 overflow-hidden backdrop-blur-md transition-all duration-300 md:hidden",
          isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="flex flex-col items-center gap-4 py-6">
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
          <li className="w-full px-10 flex flex-col gap-3 mt-4">
            <Button variant="soft" size="md" href="/creator" onClick={() => setIsMobileMenuOpen(false)}>
              SAYA KONTEN KREATOR
            </Button>
            <Button variant="primary" size="md" href="/umkm" onClick={() => setIsMobileMenuOpen(false)}>
              SAYA PEMILIK UMKM
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
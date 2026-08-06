import type { Metadata } from "next";
import { OAuthUmkmDataForm } from "@/components/features/auth/OAuthUmkmDataForm";

export const metadata: Metadata = {
  title: "Lengkapi Data Usaha — Marketiv",
};

/**
 * Halaman form data tambahan UMKM setelah pendaftaran via Google OAuth.
 * Role sudah dipastikan "umkm" di OAuthCallback sebelum redirect ke sini.
 */
export default function OAuthCompletePage() {
  return <OAuthUmkmDataForm />;
}

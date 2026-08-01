import type { Metadata } from "next";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";
import { LoginForm } from "@/components/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Masuk — Marketiv",
  description: "Masuk ke dashboard UMKM atau Kreator Marketiv.",
};

/**
 * `searchParams` dibaca di server (Promise sejak Next 16), bukan lewat
 * useSearchParams di klien: hook itu memaksa boundary <Suspense> dan tanpanya
 * `next build` gagal dengan CSR bailout — loading.tsx tidak memenuhi syarat itu.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next } = await searchParams;

  // Hanya terima path internal. `next` datang dari URL, jadi tanpa penyaringan
  // ini ia bisa dipakai mengarahkan user ke host lain setelah login.
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return (
    <RedirectIfAuthenticated next={safeNext}>
      <LoginForm next={safeNext} />
    </RedirectIfAuthenticated>
  );
}

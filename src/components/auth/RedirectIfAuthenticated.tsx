"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { dashboardByRole } from "@/lib/constants/routes";

/**
 * Lempar user yang sudah punya sesi keluar dari halaman auth.
 *
 * Sesi Appwrite hidup di browser (SDK web menyimpannya di sana), jadi ini
 * memang harus client-side — `redirect()` server tidak bisa melihatnya.
 *
 * Precedence guard:
 *   1. loading / belum ada user   → render children (form login/register)
 *   2. user ada tapi email belum  → render children (layar OTP masih di sini)
 *      terverifikasi
 *   3. user ada + email verified  → redirect ke dashboard sesuai role
 *
 * Ini memastikan layar OTP (EmailVerificationPending) tetap ditampilkan
 * meskipun Appwrite session sudah aktif setelah register, karena
 * emailVerification masih false.
 */
export function RedirectIfAuthenticated({
  next,
  children,
}: {
  next?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, errorCode } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    // User belum verifikasi email → jangan redirect, biarkan layar OTP render.
    if (!user.emailVerified) return;
    router.replace(next || dashboardByRole[user.role]);
  }, [loading, user, next, router]);

  // errorCode "not_found" = akun & sesi ada, tapi baris `users` belum terbentuk
  // (blocker A-1). JANGAN diperlakukan sebagai "sudah login": mengarahkannya ke
  // dashboard membuat RoleGuard memantulkannya balik ke sini — loop tak berujung.
  // Halaman auth tetap dirender supaya user punya jalan keluar.
  //
  // User belum verifikasi email juga harus tetap bisa melihat halaman auth
  // (layar OTP di-render sebagai children dari register form).
  if (!loading && user && user.emailVerified && errorCode !== "not_found") return null;

  return <>{children}</>;
}

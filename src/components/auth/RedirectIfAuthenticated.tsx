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
    router.replace(next || dashboardByRole[user.role]);
  }, [loading, user, next, router]);

  // errorCode "not_found" = akun & sesi ada, tapi baris `users` belum terbentuk
  // (blocker A-1). JANGAN diperlakukan sebagai "sudah login": mengarahkannya ke
  // dashboard membuat RoleGuard memantulkannya balik ke sini — loop tak berujung.
  // Halaman auth tetap dirender supaya user punya jalan keluar.
  if (!loading && user && errorCode !== "not_found") return null;

  return <>{children}</>;
}

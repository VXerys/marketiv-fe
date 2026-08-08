"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { routes, dashboardByRole } from "@/lib/constants/routes";
import { provisionUserProfile } from "@/services/auth/auth.service";
import { isOnboardingSkipped } from "@/lib/onboarding-skip";
import type { UserRole } from "@/types/domain";

/**
 * Guard role di batas layout dashboard.
 *
 * Sejak s6-guard-redirect, mode mock TIDAK lagi mem-bypass guard: guard yang
 * tidak pernah dieksekusi adalah guard yang tidak pernah teruji. Role efektif di
 * mode mock ditentukan getMockRole() (dipilih saat login mock, atau lewat
 * NEXT_PUBLIC_MOCK_ROLE).
 *
 * - tanpa sesi         → /login?next=<path>
 * - sesi tanpa profil  → kartu pemulihan (BUKAN redirect — lihat di bawah)
 * - role salah         → dashboard role yang benar
 * - suspended          → blokir dengan pesan eksplisit
 * - profil belum lengkap → /onboarding, kecuali sudah dilewati sesi ini
 */
export function RoleGuard({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, errorCode } = useAuth();

  const mismatchedRole = !loading && user != null && user.role !== role;
  // Sesi valid tapi baris `users` belum ada — beda dengan "tidak ada sesi".
  const profileMissing = !loading && user == null && errorCode === "not_found";
  const noSession = !loading && user == null && !profileMissing;
  // Dibaca di dalam efek, bukan saat render: sessionStorage tidak ada di server
  // dan membacanya di badan komponen memicu hydration mismatch.
  const needsOnboarding =
    !loading && user != null && user.role === role && !user.isProfileCompleted;

  useEffect(() => {
    if (noSession) {
      router.replace(routes.loginWithNext(pathname));
      return;
    }
    if (mismatchedRole && user) {
      router.replace(dashboardByRole[user.role]);
      return;
    }
    if (needsOnboarding && !isOnboardingSkipped()) {
      router.replace(routes.onboarding);
    }
  }, [noSession, mismatchedRole, needsOnboarding, user, router, pathname]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  /**
   * Tanpa cabang ini, "sesi valid tapi profil belum ada" diperlakukan sama dengan
   * "tidak ada sesi": redirect ke /login → login berhasil → getSession() kembali
   * not_found → balik ke /login. Loop tak berujung.
   *
   * Ini persis state yang dihasilkan setiap akun yang didaftarkan hari ini,
   * selama `create-user-profile` belum punya execute permission (§A-1).
   */
  if (profileMissing) return <ProfileMissingCard />;

  if (!user || user.role !== role) {
    // Redirect sedang berjalan — jangan render konten dashboard sedetik pun.
    return null;
  }

  if (user.status === "suspended") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md space-y-3 rounded-2xl border border-danger-soft bg-danger-soft/20 p-6 text-center">
          <h1 className="text-lg font-extrabold text-danger-strong">Akun Ditangguhkan</h1>
          <p className="text-sm text-text-secondary">
            Akun kamu sedang ditangguhkan sehingga dashboard tidak dapat diakses.
            Hubungi admin Marketiv untuk proses peninjauan.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** Sesi hidup, profil belum terbentuk. Beri jalan keluar, bukan redirect. */
function ProfileMissingCard() {
  const router = useRouter();
  const { refresh, logout } = useAuth();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  async function handleRetry() {
    setPending(true);
    setFailed(null);
    const res = await provisionUserProfile();
    await refresh();
    setPending(false);
    if (!res.success) {
      setFailed(res.error ?? "Profil masih belum bisa dibuat. Coba lagi nanti.");
    }
  }

  async function handleLogout() {
    await logout();
    router.replace(routes.login);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-3xs">
        <h1 className="text-lg font-extrabold text-ink-900">
          Profil Belum Selesai Dibuat
        </h1>
        <p className="text-sm leading-relaxed text-ink-500">
          Kamu sudah masuk, tapi data profilmu belum terbentuk di server sehingga
          dashboard belum bisa ditampilkan. Akunmu aman — tidak perlu daftar ulang.
        </p>

        {failed && (
          <p
            role="alert"
            className="rounded-xl border border-red-200/70 bg-red-50 px-4 py-3 text-[0.76rem] font-semibold text-red-700"
          >
            {failed}
          </p>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleRetry}
            disabled={pending}
            className="min-h-[44px] w-full rounded-xl bg-orange-500 px-6 text-sm font-[800] text-white transition-all hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 disabled:pointer-events-none disabled:opacity-60 active:translate-y-0"
          >
            {pending ? "Mencoba lagi…" : "Coba buat profil lagi"}
          </button>
          <button
            onClick={handleLogout}
            disabled={pending}
            className="min-h-[44px] w-full rounded-xl border border-neutral-200 px-6 text-sm font-[800] text-ink-600 transition-all hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 disabled:pointer-events-none disabled:opacity-60"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { useAuth } from "@/components/providers/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRole } from "@/types/domain";

const DASHBOARD_BY_ROLE: Record<UserRole, string> = {
  umkm: "/dashboard/umkm",
  creator: "/dashboard/kreator",
  admin: "/",
};

/**
 * Guard role di batas layout dashboard.
 *
 * - Mode mock (NEXT_PUBLIC_USE_MOCK_DATA=true): guard di-bypass supaya dev
 *   bisa membuka kedua dashboard tanpa project Appwrite.
 * - Mode nyata: tanpa sesi → redirect "/", role salah → redirect ke dashboard
 *   role yang benar, status "suspended" → blokir dengan pesan eksplisit.
 */
export function RoleGuard({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const bypass = DATA_SOURCE_CONFIG.useMockData;

  const mismatchedRole = !loading && user != null && user.role !== role;
  const noSession = !loading && user == null;

  useEffect(() => {
    if (bypass) return;
    if (noSession) {
      router.replace("/");
      return;
    }
    if (mismatchedRole && user) {
      router.replace(DASHBOARD_BY_ROLE[user.role]);
    }
  }, [bypass, noSession, mismatchedRole, user, router]);

  if (bypass) return <>{children}</>;

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

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

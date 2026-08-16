"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminAuthError, type AdminUserSession, getCurrentAdminSession, logoutAdminSession, signInAdminSession } from "@/lib/admin/auth";
import { DashboardLayoutShell } from "./DashboardLayoutShell";

export type AdminAuthState =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "forbidden"
  | "suspended"
  | "error";

type AdminAuthContextValue = {
  state: AdminAuthState;
  session: AdminUserSession | null;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function stateFrom(error: unknown): AdminAuthState {
  if (error instanceof AdminAuthError) return error.kind;
  return "error";
}

export function canLoadProtectedAdminData(state: AdminAuthState): boolean {
  return state === "authenticated";
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>("loading");
  const [session, setSession] = useState<AdminUserSession | null>(null);

  const bootstrap = useCallback(async () => {
    setState("loading");
    setSession(null);
    try {
      const resolved = await getCurrentAdminSession();
      setSession(resolved);
      setState("authenticated");
    } catch (error) {
      setState(stateFrom(error));
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState("loading");
    setSession(null);
    try {
      const resolved = await signInAdminSession(email, password);
      setSession(resolved);
      setState("authenticated");
    } catch (error) {
      setState(stateFrom(error));
      throw error;
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(bootstrap);
  }, [bootstrap]);

  const logout = useCallback(async () => {
    try {
      await logoutAdminSession();
      setSession(null);
      setState("unauthenticated");
    } catch {
      setSession(null);
      setState("error");
    }
  }, []);

  const value = useMemo(() => ({ state, session, signIn, logout }), [state, session, signIn, logout]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  return context;
}

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const { state, logout } = useAdminAuth();
  const pathname = usePathname();
  const isLoginRoute = pathname === "/login";

  useEffect(() => {
    if (!isLoginRoute || state !== "authenticated") return;
    window.location.replace("/dashboard");
  }, [isLoginRoute, state]);

  if (isLoginRoute) return <>{children}</>;

  if (state === "authenticated") return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
  if (state === "loading") return <AdminAccessState title="Memverifikasi sesi Admin" detail="Mohon tunggu." />;
  if (state === "unauthenticated") return <AdminAccessState title="Sesi Admin diperlukan" detail="Masuk dengan akun Admin Marketiv untuk melanjutkan." actionLabel="Masuk Admin" actionHref="/login" />;
  if (state === "forbidden") {
    return (
      <AdminAccessState
        title="Akses Admin ditolak"
        detail="Akun ini bukan Admin Marketiv. Pastikan label 'admin' atau role 'admin' terpasang di Appwrite."
        actionLabel="Keluar & Coba Akun Lain"
        onAction={() => void logout()}
      />
    );
  }
  if (state === "suspended") {
    return (
      <AdminAccessState
        title="Akun Admin tidak aktif"
        detail="Hubungi Marketiv untuk mengaktifkan kembali akun."
        actionLabel="Keluar & Coba Akun Lain"
        onAction={() => void logout()}
      />
    );
  }
  return (
    <AdminAccessState
      title="Verifikasi Admin gagal"
      detail="Data operasional tidak dimuat. Coba muat ulang atau hubungi support."
      actionLabel="Muat Ulang"
      onAction={() => window.location.reload()}
    />
  );
}

export function AdminAccessState({
  title,
  detail,
  actionLabel,
  actionHref,
  onAction,
}: {
  title: string;
  detail: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F3EE] p-6 text-center">
      <div className="max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <h1 className="text-lg font-black text-[#0c172b]">{title}</h1>
        <p className="mt-3 text-sm text-stone-600">{detail}</p>
        {actionLabel && actionHref ? (
          <a
            href={actionHref}
            className="mt-6 inline-flex rounded-xl bg-[#0c172b] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#172541]"
          >
            {actionLabel}
          </a>
        ) : null}
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 inline-flex cursor-pointer rounded-xl bg-[#0c172b] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#172541]"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </main>
  );
}

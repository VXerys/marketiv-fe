"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminAuthError, type AdminUserSession, getCurrentAdminSession, logoutAdminSession } from "@/lib/admin/auth";
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
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function getUserAppLoginUrl(): string {
  const raw = process.env.NEXT_PUBLIC_USER_APP_URL?.trim();
  if (!raw) throw new Error("NEXT_PUBLIC_USER_APP_URL is required to redirect to login.");
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("NEXT_PUBLIC_USER_APP_URL must use http or https.");
  return new URL("/login", url.origin).toString();
}

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

  const value = useMemo(() => ({ state, session, logout }), [state, session, logout]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  return context;
}

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const { state } = useAdminAuth();

  useEffect(() => {
    if (state !== "unauthenticated") return;
    try {
      window.location.replace(getUserAppLoginUrl());
    } catch {
      // Fail closed with the local error state below if cross-app config is invalid.
    }
  }, [state]);

  if (state === "authenticated") return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
  if (state === "loading") return <AdminAccessState title="Memverifikasi sesi Admin" detail="Mohon tunggu." />;
  if (state === "unauthenticated") return <AdminAccessState title="Sesi Admin diperlukan" detail="Mengarahkan ke halaman login Marketiv." />;
  if (state === "forbidden") return <AdminAccessState title="Akses Admin ditolak" detail="Akun ini bukan Admin Marketiv." />;
  if (state === "suspended") return <AdminAccessState title="Akun Admin tidak aktif" detail="Hubungi Marketiv untuk mengaktifkan kembali akun." />;
  return <AdminAccessState title="Verifikasi Admin gagal" detail="Data operasional tidak dimuat. Coba muat ulang atau hubungi support." />;
}

function AdminAccessState({ title, detail }: { title: string; detail: string }) {
  return <main className="grid min-h-screen place-items-center bg-[#F7F3EE] p-6 text-center"><div className="max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"><h1 className="text-lg font-black text-[#0c172b]">{title}</h1><p className="mt-2 text-sm text-stone-600">{detail}</p></div></main>;
}

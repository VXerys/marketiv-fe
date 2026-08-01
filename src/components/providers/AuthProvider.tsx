"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getSession,
  logout as logoutSession,
  type SessionUser,
} from "@/services/auth/session.service";
import type { ServiceErrorCode } from "@/types/domain";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  /** Kode error terakhir — UI memetakan code, bukan teks pesan (R3). */
  errorCode: ServiceErrorCode | null;
  error: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<ServiceErrorCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applySession = useCallback(
    (res: Awaited<ReturnType<typeof getSession>>) => {
      if (res.success && res.data) {
        setUser(res.data);
        setErrorCode(null);
        setError(null);
      } else {
        setUser(null);
        setErrorCode(res.code ?? "unknown");
        setError(res.error ?? null);
      }
      setLoading(false);
    },
    []
  );

  /** Refresh manual (dipanggil dari event handler, bukan dari body effect). */
  const refresh = useCallback(async () => {
    setLoading(true);
    applySession(await getSession());
  }, [applySession]);

  // Fetch awal: state hanya diubah setelah promise selesai, bukan sinkron di
  // dalam body effect (menghindari cascading render).
  useEffect(() => {
    let cancelled = false;
    void getSession().then((res) => {
      if (!cancelled) applySession(res);
    });
    return () => {
      cancelled = true;
    };
  }, [applySession]);

  const logout = useCallback(async () => {
    await logoutSession();
    setUser(null);
    // errorCode/error harus ikut dibersihkan: RedirectIfAuthenticated dan
    // RoleGuard sama-sama bercabang di errorCode, jadi sisa "not_found" dari
    // sesi sebelumnya akan salah dibaca sebagai profil yang belum terbentuk.
    setErrorCode(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, errorCode, error, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  }
  return ctx;
}

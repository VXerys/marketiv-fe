"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getUmkmProfile } from "@/services/umkm/umkm-dashboard.service";

export interface UmkmIdentity {
  businessName: string;
  avatarUrl: string;
  isVerified: boolean;
}

export interface UmkmIdentityContextValue {
  identity: UmkmIdentity | null;
  loading: boolean;
  error: string | null;
  refreshIdentity: () => Promise<void>;
}

const UmkmIdentityContext = createContext<UmkmIdentityContextValue | null>(null);

export function UmkmIdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<UmkmIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdentity = useCallback(async () => {
    try {
      const res = await getUmkmProfile();
      if (res.success && res.data) {
        setIdentity({
          businessName: res.data.businessName || "",
          avatarUrl: res.data.avatarUrl || "",
          isVerified: Boolean(res.data.isVerified),
        });
        setError(null);
      } else {
        setError(res.error || "Gagal memuat profil UMKM");
      }
    } catch (err) {
      console.error("Failed to load UMKM profile identity:", err);
      setError("Terjadi kesalahan saat memuat profil");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshIdentity = useCallback(async () => {
    await fetchIdentity();
  }, [fetchIdentity]);

  useEffect(() => {
    let active = true;
    void fetchIdentity();
    return () => {
      active = false;
    };
  }, [fetchIdentity]);

  return (
    <UmkmIdentityContext.Provider
      value={{
        identity,
        loading,
        error,
        refreshIdentity,
      }}
    >
      {children}
    </UmkmIdentityContext.Provider>
  );
}

export function useUmkmIdentity(): UmkmIdentityContextValue {
  const context = useContext(UmkmIdentityContext);
  if (!context) {
    throw new Error("useUmkmIdentity harus digunakan di dalam UmkmIdentityProvider");
  }
  return context;
}

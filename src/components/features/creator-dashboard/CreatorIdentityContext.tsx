"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getCreatorProfile } from "@/services/creator/creator-dashboard.service";

export interface CreatorIdentity {
  name: string;
  username: string;
  avatarUrl: string;
  isVerified: boolean;
}

export interface CreatorIdentityContextValue {
  identity: CreatorIdentity | null;
  loading: boolean;
  error: string | null;
  refreshIdentity: () => Promise<void>;
}

const CreatorIdentityContext = createContext<CreatorIdentityContextValue | null>(null);

export function CreatorIdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<CreatorIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdentity = useCallback(async () => {
    try {
      const res = await getCreatorProfile();
      if (res.success && res.data) {
        setIdentity({
          name: res.data.name || "",
          username: res.data.username || "",
          avatarUrl: res.data.avatarUrl || "",
          isVerified: Boolean(res.data.isVerified),
        });
        setError(null);
      } else {
        setError(res.error || "Gagal memuat profil kreator");
      }
    } catch (err) {
      console.error("Failed to load creator profile identity:", err);
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
    <CreatorIdentityContext.Provider
      value={{
        identity,
        loading,
        error,
        refreshIdentity,
      }}
    >
      {children}
    </CreatorIdentityContext.Provider>
  );
}

export function useCreatorIdentity(): CreatorIdentityContextValue {
  const context = useContext(CreatorIdentityContext);
  if (!context) {
    throw new Error("useCreatorIdentity harus digunakan di dalam CreatorIdentityProvider");
  }
  return context;
}

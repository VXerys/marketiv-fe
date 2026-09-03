"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { TosConsentDialog } from "@/components/features/legal/TosConsentDialog";
import { useAuth } from "@/components/providers/AuthProvider";
import { acceptCurrentTos, getTosStatus, type TosStatus } from "@/services/auth/tos.service";

interface TosConsentContextValue {
  ensureCurrentConsent: () => Promise<boolean>;
}

const TosConsentContext = createContext<TosConsentContextValue | null>(null);

type ConsentPhase = "loading" | "ready" | "error";

export function TosConsentGate({ children }: { children: React.ReactNode }) {
  const { refresh } = useAuth();
  const [phase, setPhase] = useState<ConsentPhase>("loading");
  const [status, setStatus] = useState<TosStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const statusRequest = useRef<Promise<TosStatus | null> | null>(null);

  const verifyStatus = useCallback(async (): Promise<TosStatus | null> => {
    if (statusRequest.current) return statusRequest.current;

    setPhase("loading");
    setError(null);
    const request = (async () => {
      try {
        const result = await getTosStatus();
        if (!result.success || !result.data) {
          setStatus(null);
          setPhase("error");
          setError(result.error ?? "Status persetujuan belum dapat diverifikasi. Coba lagi.");
          return null;
        }

        setStatus(result.data);
        setChecked(false);
        setPhase("ready");
        return result.data;
      } catch {
        setStatus(null);
        setPhase("error");
        setError("Status persetujuan belum dapat diverifikasi. Coba lagi.");
        return null;
      } finally {
        statusRequest.current = null;
      }
    })();
    statusRequest.current = request;
    return request;
  }, []);

  useEffect(() => {
    void verifyStatus();
  }, [verifyStatus]);

  const ensureCurrentConsent = useCallback(async () => {
    const latestStatus = await verifyStatus();
    return latestStatus?.needsConsent === false;
  }, [verifyStatus]);

  const accept = useCallback(async () => {
    const version = status?.currentVersion;
    if (!version || !checked || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const accepted = await acceptCurrentTos(version);
      if (!accepted.success || !accepted.data?.success) {
        setError(accepted.error ?? "Persetujuan belum dapat disimpan. Coba lagi.");
        return;
      }

      const refreshed = await refresh({ background: true, preserveUserOnError: true });
      const refreshedUser = refreshed.success ? refreshed.data : null;
      const verifiedAcceptedAt = refreshedUser?.tosAcceptedAt;
      if (refreshedUser?.tosVersion !== version || !verifiedAcceptedAt) {
        setError("Persetujuan tersimpan, tetapi sesi belum bisa memverifikasi versi terbaru. Coba lagi.");
        return;
      }

      setStatus((previous) => previous ? { ...previous, acceptedVersion: version, acceptedAt: verifiedAcceptedAt, needsConsent: false } : previous);
      setChecked(false);
    } catch {
      setError("Persetujuan belum dapat disimpan atau diverifikasi. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }, [checked, refresh, status, submitting]);

  const dialogOpen = phase === "error" || (phase === "ready" && status?.needsConsent === true);
  const contextValue = { ensureCurrentConsent };

  return (
    <TosConsentContext.Provider value={contextValue}>
      {phase === "ready" && status?.needsConsent === false && children}
      <TosConsentDialog
        open={dialogOpen}
        currentVersion={phase === "ready" ? status?.currentVersion ?? null : null}
        error={error}
        submitting={submitting}
        checked={checked}
        onCheckedChange={setChecked}
        onAccept={accept}
        onRetryStatus={() => { void verifyStatus(); }}
      />
    </TosConsentContext.Provider>
  );
}

export function useTosConsent(): TosConsentContextValue {
  const value = useContext(TosConsentContext);
  if (!value) {
    throw new Error("useTosConsent harus dipakai di dalam <TosConsentGate>.");
  }
  return value;
}

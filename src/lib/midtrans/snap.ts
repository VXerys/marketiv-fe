import { midtransConfig, isMidtransConfigured } from "@/config/midtrans.config";

/**
 * Loader snap.js Midtrans.
 *
 * Script dimuat lazy (hanya saat user benar-benar membayar) supaya halaman
 * wizard tidak menarik skrip gateway sebelum dibutuhkan.
 */

export type SnapCallbacks = {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
};

export type SnapApi = {
  pay: (token: string, callbacks?: SnapCallbacks) => void;
};

declare global {
  interface Window {
    snap?: SnapApi;
  }
}

const SCRIPT_ID = "midtrans-snap";

const snapScriptUrl = (): string =>
  midtransConfig.env === "production"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

let loading: Promise<SnapApi> | null = null;

/**
 * Muat snap.js sekali lalu kembalikan `window.snap`.
 * @throws Error bila client key belum diset atau script gagal dimuat.
 */
export function loadSnap(): Promise<SnapApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Snap hanya bisa dimuat di browser."));
  }
  if (window.snap) return Promise.resolve(window.snap);
  if (!isMidtransConfigured()) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_MIDTRANS_CLIENT_KEY belum diset — pembayaran tidak bisa dibuka.")
    );
  }
  if (loading) return loading;

  loading = new Promise<SnapApi>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = snapScriptUrl();
    script.async = true;
    script.setAttribute("data-client-key", midtransConfig.clientKey);
    script.onload = () => {
      if (window.snap) resolve(window.snap);
      else reject(new Error("snap.js dimuat tapi window.snap tidak tersedia."));
    };
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Gagal memuat snap.js Midtrans."));
    };
    if (!existing) document.body.appendChild(script);
  });

  return loading;
}

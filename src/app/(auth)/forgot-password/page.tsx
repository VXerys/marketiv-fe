import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Lupa Password — Marketiv",
  description: "Minta tautan untuk mengatur ulang password akun Marketiv kamu.",
};

/**
 * Sengaja TIDAK dibungkus RedirectIfAuthenticated: user yang sesinya masih hidup
 * tapi lupa passwordnya tetap berhak meminta tautan pemulihan.
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

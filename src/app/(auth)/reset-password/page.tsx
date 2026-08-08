import type { Metadata } from "next";
import {
  ResetPasswordForm,
  InvalidRecoveryLink,
} from "@/components/features/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Buat Password Baru — Marketiv",
  description: "Atur ulang password akun Marketiv kamu.",
};

/**
 * `userId` & `secret` datang dari tautan email Appwrite. Dibaca di server —
 * useSearchParams di klien akan memaksa boundary <Suspense> dan menggagalkan
 * build dengan CSR bailout.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; secret?: string }>;
}) {
  const { userId, secret } = await searchParams;

  if (!userId || !secret) return <InvalidRecoveryLink />;

  return <ResetPasswordForm userId={userId} secret={secret} />;
}

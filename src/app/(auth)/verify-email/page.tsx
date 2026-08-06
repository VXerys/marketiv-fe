import type { Metadata } from "next";
import { VerifyEmailPage } from "@/components/features/auth/VerifyEmailPage";

export const metadata: Metadata = {
  title: "Verifikasi Email — Marketiv",
};

interface PageProps {
  searchParams: Promise<{ userId?: string; secret?: string }>;
}

/**
 * Tujuan tautan verifikasi email dari Appwrite.
 * Appwrite meng-append `?userId=<id>&secret=<token>` ke URL ini.
 */
export default async function VerifyEmailRoute({ searchParams }: PageProps) {
  const { userId = "", secret = "" } = await searchParams;
  return <VerifyEmailPage userId={userId} secret={secret} />;
}

import type { Metadata } from "next";
import { OAuthCallback } from "@/components/features/auth/OAuthCallback";

export const metadata: Metadata = {
  title: "Menyiapkan akun — Marketiv",
};

export default async function OAuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return <OAuthCallback next={safeNext} />;
}

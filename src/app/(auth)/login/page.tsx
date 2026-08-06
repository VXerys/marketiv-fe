import type { Metadata } from "next";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { LoginRoleHub } from "@/components/features/auth/LoginRoleHub";
import { registrableRoleSchema } from "@/lib/validations/auth.schema";

const TITLES: Record<string, string> = {
  umkm: "Masuk sebagai UMKM — Marketiv",
  creator: "Masuk sebagai Kreator — Marketiv",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}): Promise<Metadata> {
  const { role } = await searchParams;
  const parsed = registrableRoleSchema.safeParse(role);
  const title = parsed.success ? (TITLES[parsed.data] ?? "Masuk — Marketiv") : "Masuk — Marketiv";
  return {
    title,
    description: "Masuk ke dashboard UMKM atau Kreator Marketiv.",
  };
}

/**
 * Login page dengan dua mode:
 * - Tanpa ?role=  → LoginRoleHub (pilih peran dulu)
 * - ?role=umkm/creator → LoginForm role-spesifik dengan split-screen
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; role?: string }>;
}) {
  const { next, role } = await searchParams;

  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;
  const parsedRole = registrableRoleSchema.safeParse(role);

  return (
    <RedirectIfAuthenticated next={safeNext}>
      {parsedRole.success ? (
        <LoginForm next={safeNext} role={parsedRole.data} />
      ) : (
        <LoginRoleHub />
      )}
    </RedirectIfAuthenticated>
  );
}

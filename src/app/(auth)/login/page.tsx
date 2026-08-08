import type { Metadata } from "next";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";
import { LoginForm } from "@/components/features/auth/LoginForm";
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
 * Login page:
 * Langsung menampilkan form login split-screen tanpa kartu hub pemilih peran.
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
      <LoginForm next={safeNext} role={parsedRole.success ? parsedRole.data : "umkm"} />
    </RedirectIfAuthenticated>
  );
}

import type { Metadata } from "next";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";
import { RoleChooser } from "@/components/features/auth/RoleChooser";
import { RegisterUmkmForm } from "@/components/features/auth/RegisterUmkmForm";
import { RegisterCreatorForm } from "@/components/features/auth/RegisterCreatorForm";
import { registrableRoleSchema } from "@/lib/validations/auth.schema";

export const metadata: Metadata = {
  title: "Daftar — Marketiv",
  description: "Buat akun UMKM atau Kreator di Marketiv.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const parsed = registrableRoleSchema.safeParse(role);

  return (
    <RedirectIfAuthenticated preserveUnverifiedSession>
      {!parsed.success ? (
        <RoleChooser />
      ) : parsed.data === "umkm" ? (
        <RegisterUmkmForm />
      ) : (
        <RegisterCreatorForm />
      )}
    </RedirectIfAuthenticated>
  );
}

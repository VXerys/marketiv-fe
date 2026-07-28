import { AuthBrand } from "@/components/auth/AuthCard";

/**
 * Shell halaman auth.
 *
 * Tidak membungkus <RedirectIfAuthenticated> di sini: tiap halaman butuh `next`
 * dari searchParams-nya sendiri, dan searchParams tidak tersedia di layout.
 * Halaman yang memanggilnya sendiri (login/register/forgot/reset).
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <AuthBrand />
      {children}
    </main>
  );
}

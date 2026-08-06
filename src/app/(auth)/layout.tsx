/**
 * Shell halaman auth ultra-premium.
 *
 * Menggunakan background gradient halus dan flex centering untuk kenyamanan pengguna.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-neutral-50 via-orange-50/15 to-neutral-100/80 px-4 py-8 sm:py-12">
      {/* Decorative ambient glow in background */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-72 w-full max-w-4xl bg-orange-400/10 blur-3xl rounded-full"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </main>
  );
}

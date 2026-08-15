import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { DashboardLayoutShell } from "@/components/admin/DashboardLayoutShell";
import { fetchDashboardMetrics } from "@/features/admin/dashboard/fixtures/dashboard.fixtures";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Marketiv Admin Control Plane",
  description: "Marketiv Operational Admin Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const metrics = await fetchDashboardMetrics();

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} ${sora.variable} antialiased`}>
        <DashboardLayoutShell pendingCount={metrics.pendingSubmissionsCount}>
          {children}
        </DashboardLayoutShell>
        <Toaster />
      </body>
    </html>
  );
}

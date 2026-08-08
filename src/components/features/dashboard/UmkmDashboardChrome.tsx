"use client";

import { type ReactNode, useEffect, useState } from "react";
import { DashboardShell } from "./DashboardShell";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import { getUmkmProfile } from "@/services/umkm/umkm-dashboard.service";

interface UmkmDashboardChromeProps {
  /**
   * Nama usaha untuk sidebar. Boleh dikosongkan — chrome mengambilnya sendiri.
   *
   * Sebelum `s5-businessname-hardcode`, enam route masing-masing memuat profil
   * lalu jatuh ke `|| "Dapur Sehat Sukabumi"` saat gagal. Artinya kegagalan baca
   * profil tampil sebagai nama usaha ORANG LAIN, bukan sebagai kegagalan — dan
   * di demo dengan akun baru itu satu-satunya nama yang akan terlihat.
   *
   * Sekarang sumbernya satu, dan kalau gagal namanya kosong.
   */
  businessName?: string;
  children: ReactNode;
}

export function UmkmDashboardChrome({ businessName, children }: UmkmDashboardChromeProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fetchedName, setFetchedName] = useState("");
  const [fetchedAvatar, setFetchedAvatar] = useState("");

  // Hanya menjemput sendiri kalau pemanggil tidak menyediakannya (halaman yang
  // memang sudah memuat profil untuk keperluan lain tetap mengoper propnya).
  const needsFetch = businessName === undefined;

  useEffect(() => {
    if (!needsFetch) return;
    let active = true;
    void getUmkmProfile().then((res) => {
      if (active && res.success && res.data) {
        setFetchedName(res.data.businessName);
        setFetchedAvatar(res.data.avatarUrl ?? "");
      }
    });
    return () => {
      active = false;
    };
  }, [needsFetch]);

  return (
    <DashboardShell
      isSidebarOpen={isSidebarOpen}
      onCloseSidebar={() => setIsSidebarOpen(false)}
      sidebar={
        <DashboardSidebar
          businessName={businessName ?? fetchedName}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      }
      topbar={<DashboardTopbar onOpenSidebar={() => setIsSidebarOpen(true)} avatarUrl={fetchedAvatar} />}
    >
      {children}
    </DashboardShell>
  );
}

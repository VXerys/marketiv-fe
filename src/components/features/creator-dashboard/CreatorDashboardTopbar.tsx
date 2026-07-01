import Image from "next/image";
import Link from "next/link";

interface CreatorDashboardTopbarProps {
  creatorName: string;
  creatorAvatar: string;
  onOpenSidebar: () => void;
}

export function CreatorDashboardTopbar({
  creatorName,
  creatorAvatar,
  onOpenSidebar,
}: CreatorDashboardTopbarProps) {
  return (
    <header className="topbar-glass sticky top-0 z-40 flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 shadow-[0_2px_12px_rgba(16,32,51,0.01)] h-[76px]">
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar hamburger */}
        <button
          className="lg:hidden p-2 -ml-2 rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all cursor-pointer"
          onClick={onOpenSidebar}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            {/* Mobile Branding */}
            <div className="lg:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center shadow-md">
              <span className="font-extrabold text-sm text-white">M</span>
            </div>
            <h1 className="font-extrabold text-base lg:text-xl text-neutral-900 leading-none tracking-tight">
              Dashboard Kreator
            </h1>
          </div>
          <p className="hidden md:block text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1.5">
            Kelola job pool, posting bukti tayang, dan pantau penghasilan Anda
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* Active job quick check button */}
        <Link
          href="/dashboard/kreator/job-pool"
          className="hidden md:inline-flex bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:shadow-[0_8px_20px_rgba(249,115,22,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all border border-white/20 shadow-sm"
        >
          Cari Pekerjaan Baru
        </Link>

        {/* Notifications Icon */}
        <button className="relative text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/50 transition-all p-3 rounded-full bg-white shadow-sm border border-border-soft group cursor-pointer">
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          <span>
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </span>
        </button>

        {/* Creator profile photo */}
        <Link
          href="/dashboard/kreator/profil"
          className="w-10 h-10 rounded-full border border-neutral-200/50 shadow-sm overflow-hidden cursor-pointer hover:scale-105 transition-all relative block"
        >
          <Image
            alt={creatorName}
            className="w-full h-full object-cover"
            src={creatorAvatar}
            width={40}
            height={40}
            sizes="40px"
            quality={75}
          />
        </Link>
      </div>
    </header>
  );
}

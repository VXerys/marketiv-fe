"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, MapPin, MessageCircle, CheckCircle2 } from "lucide-react";
import * as Avatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { formatCompactViews } from "@/lib/formatters";
import type { Creator } from "@/types/campaign";

interface CreatorCardProps {
  creator: Creator;
}

const AVATAR_GRADIENTS: Record<string, string> = {
  kuliner:    "linear-gradient(135deg, #fed7aa, #fb923c)",
  fashion:     "linear-gradient(135deg, #a78bfa, #6d28d9)", // diselaraskan ke fashion
  pariwisata: "linear-gradient(135deg, #93c5fd, #1e3a5f)",
  edukasi:    "linear-gradient(135deg, #a3e635, #16a34a)",
  kecantikan: "linear-gradient(135deg, #f9a8d4, #be185d)",
  lainnya:    "linear-gradient(135deg, #818cf8, #4f46e5)",
};

export function CreatorCard({ creator }: CreatorCardProps) {
  const router = useRouter();
  
  const categoryLower = creator.category.toLowerCase();
  const avatarGradient = AVATAR_GRADIENTS[categoryLower] ?? AVATAR_GRADIENTS.kuliner;

  return (
    <div 
      className="border border-border rounded-[28px] overflow-hidden min-w-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md self-stretch flex flex-col p-5"
      style={{
        background: "radial-gradient(circle at 100% 0%, rgba(249,115,22,.08), transparent 12rem), white",
      }}
    >
      {/* Header: avatar + name + status */}
      <div className="flex gap-3.5 items-center mb-4.5">
        <Avatar.Root className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-border flex items-center justify-center bg-ink-100">
          <Avatar.Image
            src={creator.imageUrl}
            alt={creator.name}
            className="w-full h-full object-cover"
          />
          <Avatar.Fallback 
            className="w-full h-full flex items-center justify-center text-sm font-bold text-white uppercase"
            style={{ background: avatarGradient }}
          >
            {creator.name.slice(0, 2)}
          </Avatar.Fallback>
        </Avatar.Root>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <strong className="block text-ink-950 font-display text-[1.08rem] font-extrabold tracking-tight truncate leading-snug">
              {creator.name}
            </strong>
            {creator.isVerified && (
              <span className="shrink-0 text-blue-500" title="Kreator Terverifikasi">
                <CheckCircle2 size={15} fill="currentColor" className="text-white" />
              </span>
            )}
          </div>
          <span className="block text-[.82rem] font-[650] text-ink-500 mt-0.5 truncate leading-none">
            @{creator.name.toLowerCase().replace(/\s+/g, "")}
          </span>
          <div className="flex items-center gap-1 mt-1 text-[.74rem] text-ink-500 font-semibold leading-none">
            <MapPin size={11} className="text-ink-400" />
            <span>{creator.location || "Jakarta"}</span>
          </div>
        </div>
      </div>

      {/* Button stack: custom badges */}
      <div className="flex flex-wrap gap-1.5 mb-4 leading-none">
        <span className="inline-flex items-center justify-center min-h-[26px] px-2.5 rounded-full border border-orange-200/50 bg-orange-50 text-orange-700 text-[.7rem] font-[800] uppercase tracking-wide">
          {creator.category}
        </span>
        <span className="inline-flex items-center justify-center min-h-[26px] px-2.5 rounded-full border border-blue-200/50 bg-blue-50 text-blue-700 text-[.7rem] font-[800]">
          {creator.rateCardCount || 1} Paket Jasa
        </span>
        {creator.isVerified && (
          <span className="inline-flex items-center justify-center min-h-[26px] px-2.5 rounded-full border border-emerald-200/50 bg-emerald-50 text-emerald-700 text-[.7rem] font-[800] gap-1">
            Verified
          </span>
        )}
      </div>

      {/* Offer mini box — dari design system v5.8 */}
      <div className="p-4 rounded-[22px] border border-orange-200/20 bg-gradient-to-b from-[#fffaf4] to-[#fff3e7] mb-5 grid gap-1 mt-auto">
        <strong className="text-orange-700 font-display text-xl font-bold tracking-tighter leading-none">
          {creator.estimatedSalary}
        </strong>
        <span className="text-ink-600 text-[0.82rem] leading-[1.4] line-clamp-2">
          {creator.description}
        </span>
      </div>

      {/* Primary Actions: Lihat Profil + Chat Negosiasi (Rate Card Mode) */}
      <div className="flex items-center gap-2 mt-auto">
        <Link
          href={`/dashboard/umkm/kreator/${creator.id}`}
          className="flex-1 flex items-center justify-center min-h-[44px] rounded-xl border border-border bg-ink-100 hover:bg-ink-200/80 text-ink-800 font-[800] text-[.86rem] tracking-tight transition-all duration-200 no-underline"
        >
          Lihat Profil Kreator
        </Link>
        <button
          type="button"
          aria-label="Mulai negosiasi dengan kreator ini"
          onClick={() => router.push("/dashboard/umkm/negosiasi")}
          className="w-11 h-11 shrink-0 rounded-xl border border-orange-600/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white grid place-items-center hover:shadow-[0_4px_14px_rgba(234,88,12,.22)] hover:-translate-y-px transition-all duration-200 cursor-pointer"
        >
          <MessageCircle size={17} />
        </button>
      </div>
    </div>
  );
}

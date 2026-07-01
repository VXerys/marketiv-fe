"use client";

import Link from "next/link";
import { Star, Users, TrendingUp, MapPin, MessageCircle } from "lucide-react";
import type { Creator } from "@/types/campaign";

interface CreatorCardProps {
  creator: Creator;
}

const AVATAR_GRADIENTS: Record<string, string> = {
  kuliner:    "linear-gradient(135deg, #fed7aa, #fb923c)",
  fesyen:     "linear-gradient(135deg, #a78bfa, #6d28d9)",
  pariwisata: "linear-gradient(135deg, #93c5fd, #1e3a5f)",
  edukasi:    "linear-gradient(135deg, #a3e635, #16a34a)",
  kecantikan: "linear-gradient(135deg, #f9a8d4, #be185d)",
  lainnya:    "linear-gradient(135deg, #818cf8, #4f46e5)",
};

export function CreatorCard({ creator }: CreatorCardProps) {
  const categoryLower  = creator.category.toLowerCase();
  const avatarGradient = AVATAR_GRADIENTS[categoryLower] ?? AVATAR_GRADIENTS.kuliner;
  const avatarStyle    = creator.imageUrl
    ? { backgroundImage: `url(${creator.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: avatarGradient };

  const stats = [
    { icon: Users,       label: "Followers",  val: creator.followers },
    { icon: TrendingUp,  label: "Engagement", val: "6.2%"            },
    { icon: MapPin,      label: "Lokasi",      val: "Jakarta"         },
  ];

  return (
    <div className="creator-card">
      {/* Header: avatar + name + niche */}
      <div className="creator-card-header">
        <div className="creator-card-avatar" style={avatarStyle} />

        <div className="creator-card-info">
          <strong className="creator-card-name">{creator.name}</strong>
          <span className="block text-[.78rem] font-[650] text-ink-500 mt-0.5 truncate">
            @{creator.name.toLowerCase().replace(/\s+/g, "")}
          </span>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap min-w-0">
            {/* Niche pill */}
            <span className="inline-flex items-center gap-1 min-h-[22px] px-2 rounded-full bg-orange-50 border border-orange-200/50 text-orange-700 text-[.68rem] font-[800] capitalize">
              {creator.category}
            </span>
            {/* Rating */}
            <span className="flex items-center gap-0.5 text-amber-600 text-[.76rem] font-[800]">
              <Star size={11} fill="currentColor" strokeWidth={0} />
              {creator.rating}
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid: followers / engagement / location */}
      <div className="creator-card-stats">
        {stats.map(({ icon: Icon, label, val }) => (
          <div key={label} className="creator-card-stat">
            <Icon size={12} className="text-ink-400 mx-auto mb-1" />
            <span className="creator-card-stat-value">{val}</span>
            <span className="creator-card-stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Actions: primary CTA + chat icon */}
      <div className="creator-card-actions">
        <Link
          href={`/dashboard/umkm/kreator/${creator.id}`}
          className="flex items-center justify-center min-h-[40px] rounded-[13px] border border-orange-700/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white font-[790] text-[.84rem] shadow-[0_8px_20px_rgba(234,88,12,.20)] hover:shadow-[0_12px_28px_rgba(234,88,12,.28)] hover:-translate-y-px transition-all duration-200 no-underline"
        >
          Lihat Profil
        </Link>
        <button
          type="button"
          aria-label="Mulai negosiasi dengan kreator ini"
          onClick={() => { window.location.href = "/dashboard/umkm/negosiasi"; }}
          className="w-10 h-10 rounded-[13px] border border-ink-900/[.09] bg-white text-ink-600 grid place-items-center hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 cursor-pointer"
        >
          <MessageCircle size={16} />
        </button>
      </div>
    </div>
  );
}

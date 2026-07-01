"use client";

import Image from "next/image";

interface CreatorPortfolioSectionProps {
  creatorId: string;
}

export function CreatorPortfolioSection({ creatorId }: CreatorPortfolioSectionProps) {
  const idNum = parseInt(creatorId) || 1;

  // Mock portfolio item details
  const items = [
    {
      id: "p1",
      title: "Review Cemilan Viral",
      views: ((idNum * 12) % 100 + 15) + "K Views",
      likes: ((idNum * 4) % 10 + 2.5) + "K",
      imgUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=500&fit=crop",
      platform: "tiktok",
    },
    {
      id: "p2",
      title: "Promo Outerwear Outfit",
      views: ((idNum * 17) % 120 + 20) + "K Views",
      likes: ((idNum * 5) % 15 + 4) + "K",
      imgUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
      platform: "instagram",
    },
    {
      id: "p3",
      title: "Daily Skincare routine",
      views: ((idNum * 23) % 150 + 35) + "K Views",
      likes: ((idNum * 8) % 20 + 6.2) + "K",
      imgUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop",
      platform: "tiktok",
    },
    {
      id: "p4",
      title: "Resep Homemade Dessert",
      views: ((idNum * 9) % 80 + 10) + "K Views",
      likes: ((idNum * 3) % 8 + 1.8) + "K",
      imgUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=500&fit=crop",
      platform: "instagram",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider">
          Portofolio Konten Terbaru
        </h3>
        <p className="text-[10px] text-text-muted font-semibold">
          Daftar video kolaborasi terselesaikan dengan total jangkauan views audiens.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl overflow-hidden border border-border-soft bg-neutral-100 aspect-[3/4] relative shadow-2xs hover:shadow-xs hover:border-primary/20 transition-all duration-350 cursor-pointer"
          >
            <Image
              src={item.imgUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform duration-350">
                <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Social Platform Icon (TikTok / Instagram) */}
            <div className="absolute top-3 right-3 z-10 h-6 w-6 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border border-white/10">
              {item.platform === "tiktok" ? (
                <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4.3 9.4a3.8 3.8 0 0 1-2.1-.6v4a3.5 3.5 0 1 1-3.5-3.5 3.4 3.4 0 0 1 1.7.5v-2.3a5.5 5.5 0 0 0-1.7-.3 5.5 5.5 0 1 0 5.5 5.5v-5.6a5.7 5.7 0 0 0 3.2.9v-2.1a3.6 3.6 0 0 1-3.1-.5z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </div>

            {/* Title & Stats */}
            <div className="absolute bottom-3 left-3 right-3 z-10 space-y-1">
              <span className="block text-[9px] font-extrabold text-success uppercase tracking-wider">
                {item.views}
              </span>
              <h4 className="text-[10px] sm:text-xs font-bold text-white line-clamp-1">
                {item.title}
              </h4>
              <div className="flex items-center gap-1.5 text-[8px] font-bold text-white/70">
                <span>❤ {item.likes} Likes</span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

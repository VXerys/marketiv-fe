"use client";

import Link from "next/link";
import Image from "next/image";
import type { Creator } from "@/types/campaign";

interface CreatorCardProps {
  creator: Creator;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  // Map category code to visual badge classes
  const getCategoryColor = (cat: string) => {
    const c = cat.toLowerCase();
    if (c === "kuliner") return "bg-orange-50 text-orange-700 border-orange-200/40";
    if (c === "fashion" || c === "fesyen") return "bg-blue-50 text-blue-700 border-blue-200/40";
    if (c === "kosmetik" || c === "kecantikan") return "bg-pink-50 text-pink-700 border-pink-200/40";
    if (c === "handmade" || c === "edukasi") return "bg-purple-50 text-purple-700 border-purple-200/40";
    return "bg-neutral-50 text-neutral-600 border-neutral-200";
  };

  return (
    <div className="group rounded-2xl bg-white border border-border-soft hover:border-primary/25 shadow-xs hover:shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.01]">
      {/* Profile Image & Badge */}
      <div className="h-40 w-full relative overflow-hidden bg-neutral-100">
        <Image
          src={creator.imageUrl}
          alt={creator.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={false}
        />
        <div className="absolute top-3 left-3 z-10">
          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold uppercase tracking-wider ${getCategoryColor(creator.category)}`}>
            {creator.category}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs sm:text-sm font-extrabold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
              {creator.name}
            </h3>
            {creator.rating >= 4.8 && (
              <span className="h-4 w-4 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a.75.75 0 00-.708-.523H4.562a1.5 1.5 0 00-1.5 1.5v1.077c0 .193-.075.378-.208.514L1.75 7.125a.75.75 0 00-.472.932l.85 2.55a.75.75 0 00.932.472l1.622-.541c.214-.071.449-.026.623.118l1.398 1.165a.75.75 0 00.999-.046l1.838-1.838a.75.75 0 00-.046-.999L8.13 7.58a1.05 1.05 0 01-.264-.783V4.562c0-.506-.25-.978-.667-1.258L6.267 3.455zM15 13.5a1.5 1.5 0 011.5-1.5h1.077a.75.75 0 00.708-.523l.562-1.686a1.5 1.5 0 00-.667-1.258l-.932-.622A1.05 1.05 0 0117 7.128V6.05c0-.193-.075-.378-.208-.514L15.688 4.43a.75.75 0 00-.999.046l-1.838 1.838a.75.75 0 00.046.999l1.165 1.398c.144.174.19.41.118.623l-.541 1.622a.75.75 0 00.472.932l2.55.85a.75.75 0 00.344-.813v-2.09c0-.28-.109-.548-.305-.745l-.445-.445z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
          <p className="text-[10px] text-text-secondary font-semibold line-clamp-2 min-h-[30px] leading-relaxed">
            {creator.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 border-y border-dashed border-border-soft py-2.5">
          <div>
            <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">
              Followers
            </span>
            <span className="text-xs font-extrabold text-text-primary block mt-0.5">
              {creator.followers}
            </span>
          </div>
          <div>
            <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">
              Rating
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <svg className="w-3.5 h-3.5 text-warning shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-extrabold text-text-primary">
                {creator.rating}
              </span>
              <span className="text-[9px] font-bold text-text-muted">
                ({creator.totalReviews})
              </span>
            </div>
          </div>
        </div>

        {/* Footer info: Rate price & Detail CTA */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">
              Mulai Dari
            </span>
            <span className="text-xs font-extrabold text-primary block mt-0.5">
              {creator.estimatedSalary}
            </span>
          </div>
          <Link
            href={`/dashboard/umkm/kreator/${creator.id}`}
            className="px-3 py-1.5 rounded-lg bg-neutral-50 hover:bg-primary hover:text-white border border-border-subtle hover:border-primary text-[10px] font-extrabold text-text-primary transition-all duration-200 cursor-pointer flex items-center gap-1 select-none"
          >
            <span>Detail</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

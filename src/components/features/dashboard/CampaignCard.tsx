import Image from "next/image";
import Link from "next/link";
import type { Campaign } from "@/types/campaign";
import { CARD_CONTENT } from "@/data/content";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <div className="bg-white rounded-[20px] overflow-hidden flex flex-col w-full h-auto shadow-[0_8px_4px_0_rgba(0,0,0,0.25)]">
      {/* Image Area */}
      <div className="relative w-full aspect-3/2 shrink-0 bg-gray-50 rounded-[20px] overflow-hidden">
        <Image
          src={campaign.imageUrl}
          alt={campaign.brandName}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Category Badge */}
        <span className="absolute top-2.5 left-3 bg-[#f77878] text-white text-[11px] md:text-xs font-semibold px-3 md:px-4 py-0.5 md:py-1 rounded-full">
          {campaign.category}
        </span>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 px-3 md:px-4 pt-2.5 pb-3">
        {/* Brand Name */}
        <h3 className="text-sm md:text-base font-semibold text-black leading-tight">
          {campaign.brandName}
        </h3>

        {/* Info Box */}
        <div className="mt-2 md:mt-2.5 bg-[#FCE1E1] rounded-xl md:rounded-2xl w-full p-2.5 md:p-3 flex flex-col gap-1.5">
          
          {/* Rate & Min View Labels */}
          <div className="flex justify-between items-center leading-none">
            <span className="text-[10px] md:text-xs font-medium text-black/70 uppercase">
              {CARD_CONTENT.labels.rate}
            </span>
            <span className="text-[10px] md:text-xs font-medium text-black/70 uppercase">
              {CARD_CONTENT.labels.minView}
            </span>
          </div>

          {/* Rate & Min View Values */}
          <div className="flex justify-between items-center leading-none">
            <span className="text-xs md:text-sm font-semibold text-black">
              {campaign.rate}
            </span>
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#f75050]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
              <span className="text-xs md:text-sm font-semibold text-[#f75050]">
                {campaign.minView}
              </span>
            </div>
          </div>

          {/* Budget Info */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-end leading-none">
              <span className="text-[9px] md:text-[10px] font-medium text-black/70 uppercase">
                {CARD_CONTENT.labels.budgetUsed}
              </span>
              <span className="text-[7px] md:text-[8px] font-semibold text-[#f75050] uppercase tracking-tight">
                {campaign.budgetUsedPercent}% {CARD_CONTENT.labels.from} {campaign.totalBudget}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 md:h-2 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f75050] rounded-[30px] transition-all duration-500"
                style={{ width: `${campaign.budgetUsedPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-2.5 mt-3">
          <Link
            href={`/campaign/${campaign.id}`}
            className="flex-[1.8] h-8 md:h-9 lg:h-10 bg-[#f77878] hover:bg-[#eb6a6a] transition-colors rounded-full flex items-center justify-center text-white text-[11px] md:text-xs lg:text-sm font-semibold"
          >
             {CARD_CONTENT.labels.ctaPrimary}
          </Link>
          <Link
            href={`/campaign/${campaign.id}`}
            className="flex-1 h-8 md:h-9 lg:h-10 bg-[#eae5e5] hover:bg-[#e0dada] transition-colors rounded-full flex items-center justify-center text-[#f77878] text-[11px] md:text-xs lg:text-sm font-semibold"
          >
             {CARD_CONTENT.labels.ctaSecondary}
          </Link>
        </div>
      </div>
    </div>
  );
}


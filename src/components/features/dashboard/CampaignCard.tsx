import Image from "next/image";
import { Button } from "@/components/ui/Button";
import type { Campaign } from "@/types/campaign";
import { CARD_CONTENT } from "@/data/content";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <div className="bg-surface rounded-3xl shadow-md overflow-hidden border border-gray-100 flex flex-col w-full max-w-[340px] h-auto mx-auto" style={{ minHeight: 477 }}>
      {/* Image Area — ~200px from Figma proportions */}
      <div className="relative w-full h-[200px] bg-pink-50">
        <Image
          src={campaign.imageUrl}
          alt={campaign.brandName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Category Badge */}
        <span className="absolute top-4 left-4 bg-brand-coral text-white text-xs font-semibold px-5 py-1.5 rounded-full shadow-sm">
          {campaign.category}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Brand Name */}
        <h3 className="text-lg font-bold text-text-main">
          {campaign.brandName}
        </h3>

        {/* Info Box */}
        <div className="mt-3 bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
          {/* Rate & Min View Row */}
          <div className="flex items-start justify-between">
            {/* Rate */}
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                {CARD_CONTENT.labels.rate}
              </span>
              <span className="text-sm font-bold text-text-main mt-0.5">
                {campaign.rate}
              </span>
            </div>
            {/* Min View */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                {CARD_CONTENT.labels.minView}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {/* Eye Icon */}
                <svg
                  className="w-4 h-4 text-brand-coral"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
                <span className="text-sm font-bold text-brand-coral">
                  {campaign.minView}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200" />

          {/* Budget Row */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                {CARD_CONTENT.labels.budgetUsed}
              </span>
              <span className="text-[10px] font-medium text-text-muted italic">
                {campaign.budgetUsedPercent}% {CARD_CONTENT.labels.from} {campaign.totalBudget}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-coral rounded-full transition-all duration-500"
                style={{ width: `${campaign.budgetUsedPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-auto pt-5">
          <Button
            variant="primary"
            size="md"
            href={`/campaign/${campaign.id}`}
            className="flex-[0.6] h-12 rounded-full text-sm font-bold"
          >
             {CARD_CONTENT.labels.ctaPrimary}
          </Button>
          <Button
            variant="soft"
            size="md"
            href={`/campaign/${campaign.id}`}
            className="flex-[0.4] h-12 rounded-full text-sm font-bold"
          >
             {CARD_CONTENT.labels.ctaSecondary}
          </Button>
        </div>
      </div>
    </div>
  );
}

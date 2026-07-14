import Image from "next/image";
import { CreatorStatusBadge } from "./CreatorStatusBadge";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface CreatorActionCardProps {
  title: string;
  subtitle: string;
  avatarUrl?: string;
  badgeText?: string;
  badgeType?: "campaign" | "claim" | "submission" | "negotiation" | "transaction";
  description?: string;
  details?: Array<{ label: string; value: string | number }>;
  actions?: React.ReactNode;
  className?: string;
}

export function CreatorActionCard({
  title,
  subtitle,
  avatarUrl,
  badgeText,
  badgeType = "campaign",
  description,
  details,
  actions,
  className,
}: CreatorActionCardProps) {
  return (
    <div className={cn(
      "bg-white/95 border border-neutral-200/50 shadow-[0_12px_30px_rgba(235,94,40,0.02)] hover:shadow-[0_20px_40px_rgba(235,94,40,0.06)] rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between h-full group",
      className
    )}>
      <div>
        {/* Header Block */}
        <div className="flex items-start gap-4 mb-4">
          {avatarUrl ? (
            <div className="w-12 h-12 rounded-xl border border-neutral-200/40 overflow-hidden shrink-0 relative bg-neutral-50 flex items-center justify-center font-bold text-neutral-400">
              <Image
                src={avatarUrl}
                alt={subtitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                width={48}
                height={48}
                sizes="48px"
                quality={80}
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 flex items-center justify-center shrink-0 font-bold text-primary">
              {title.substring(0, 1)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-neutral-900 group-hover:text-primary transition-colors text-base truncate leading-tight">
              {title}
            </h4>
            <p className="text-xs font-semibold text-neutral-400 mt-1 truncate">
              {subtitle}
            </p>
          </div>
          {badgeText && (
            <CreatorStatusBadge status={badgeText} type={badgeType} />
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-neutral-500 font-medium leading-relaxed mb-4 line-clamp-3">
            {description}
          </p>
        )}

        {/* Details Grid */}
        {details && details.length > 0 && (
          <div className="grid grid-cols-2 gap-3 py-3 px-4 rounded-xl bg-neutral-50 border border-neutral-200/30 mb-5">
            {details.map((detail, idx) => (
              <div key={idx} className="min-w-0">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">
                  {detail.label}
                </span>
                <span className="block text-xs font-extrabold text-neutral-900 truncate mt-0.5">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Block */}
      {actions && (
        <div className="mt-auto w-full pt-2 flex flex-col gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

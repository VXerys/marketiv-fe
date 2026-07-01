import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/features/umkm-dashboard/shared/DashboardCard";

interface FormSectionCardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  badge?: ReactNode;
}

export function FormSectionCard({
  title,
  description,
  icon,
  children,
  className,
  badge,
}: FormSectionCardProps) {
  return (
    <DashboardCard
      className={cn(
        "bg-amber-50/15 backdrop-blur-md relative overflow-hidden rounded-[28px] border border-neutral-200/50",
        className
      )}
    >
      {/* Premium Top Warm Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />
      
      <div className="p-6 sm:p-7.5 pt-8.5 space-y-6">
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-border-soft/60 pb-4.5">
            <div className="flex items-start gap-3 min-w-0">
              {icon && (
                <div className="h-9 w-9 rounded-xl bg-primary-50 border border-primary-100/60 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                  {icon}
                </div>
              )}
              <div className="space-y-1 pt-0.5">
                {title && (
                  <h4 className="text-sm font-extrabold text-text-primary uppercase tracking-wider leading-none">
                    {title}
                  </h4>
                )}
                {description && (
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
        )}
        
        <div className="space-y-5">
          {children}
        </div>
      </div>
    </DashboardCard>
  );
}

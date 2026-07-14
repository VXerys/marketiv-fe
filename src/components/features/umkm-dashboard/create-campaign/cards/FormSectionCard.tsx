import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl sm:rounded-[22px] bg-white shadow-3xs",
        className
      )}
      style={{ border: "1px solid rgba(17,24,39,.08)" }}
    >
      {/* Orange top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[22px]"
        style={{ background: "linear-gradient(90deg, #fb7a18 0%, #f97316 50%, #ea580c 100%)" }}
      />

      <div className="px-5 sm:px-7 pt-7 pb-6 sm:pt-8 space-y-5">
        {/* Section header */}
        {(title || description) && (
          <div
            className="flex items-start justify-between gap-4 pb-4"
            style={{ borderBottom: "1px solid rgba(17,24,39,.07)" }}
          >
            <div className="flex items-start gap-3 min-w-0">
              {icon && (
                <div className="w-9 h-9 rounded-[13px] grid place-items-center shrink-0 border"
                  style={{
                    background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
                    borderColor: "rgba(249,115,22,.18)",
                    color: "#ea580c",
                    boxShadow: "0 2px 8px rgba(249,115,22,.10)",
                  }}
                >
                  {icon}
                </div>
              )}
              <div className="space-y-0.5 pt-0.5 min-w-0">
                {title && (
                  <h4 className="font-display text-[.92rem] font-black text-ink-950 tracking-tight leading-none">
                    {title}
                  </h4>
                )}
                {description && (
                  <p className="text-[.78rem] text-ink-400 font-[550] leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
        )}

        {/* Body */}
        <div className="space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
}

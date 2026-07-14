import { ReactNode } from "react";

interface CreatorEmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionButton?: ReactNode;
}

export function CreatorEmptyState({
  title,
  description,
  icon,
  actionButton,
}: CreatorEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white/70 backdrop-blur-md rounded-2xl border border-neutral-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.01)] max-w-lg mx-auto mt-6">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary mb-6 shadow-sm">
        {icon || (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-extrabold text-neutral-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 font-medium leading-relaxed max-w-sm mb-6">
        {description}
      </p>
      {actionButton && (
        <div className="flex justify-center w-full">
          {actionButton}
        </div>
      )}
    </div>
  );
}

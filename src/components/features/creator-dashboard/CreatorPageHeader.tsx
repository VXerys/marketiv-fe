import { ReactNode } from "react";

interface CreatorPageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function CreatorPageHeader({
  title,
  description,
  children,
}: CreatorPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h2 className="text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight leading-none">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-neutral-500 font-semibold mt-2">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}

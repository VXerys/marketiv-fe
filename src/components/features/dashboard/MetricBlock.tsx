import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface MetricBlockProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
}

export function MetricBlock({ label, className, children, ...props }: MetricBlockProps) {
  return (
    <div className={cn(className)} {...props}>
      <p className="text-[10px] font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

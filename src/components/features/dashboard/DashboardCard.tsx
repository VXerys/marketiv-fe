import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type DashboardCardProps = HTMLAttributes<HTMLDivElement>;

export function DashboardCard({ className, children, ...props }: DashboardCardProps) {
  return (
    <div className={cn("bento-card", className)} {...props}>
      {children}
    </div>
  );
}

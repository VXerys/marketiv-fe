import Image from "next/image";
import { logoMarketivPng } from "@/assets/icons";
import { cn } from "@/lib/utils";

interface MarketivLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function MarketivLogo({
  className,
  size = 34,
  showText = true,
}: MarketivLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 shadow-sm border border-neutral-200/60"
        style={{ width: size, height: size }}
      >
        <Image
          src={logoMarketivPng}
          alt="Marketiv Logo"
          width={size}
          height={size}
          className="h-full w-full object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="font-display text-xl font-[900] tracking-tight text-ink-900">
          Marketiv
        </span>
      )}
    </div>
  );
}

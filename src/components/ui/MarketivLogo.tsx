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
  size = 32,
  showText = true,
}: MarketivLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-soft-1 border border-neutral-200/80"
        style={{ width: size + 6, height: size + 6 }}
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

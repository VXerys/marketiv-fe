import Image from "next/image";
import { logoMarketivPng } from "@/assets/icons";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={logoMarketivPng}
        alt="Marketiv Logo"
        width={34}
        height={34}
        className="object-contain"
        priority
      />
      <span className="font-display text-xl font-[900] tracking-tight text-ink-900">
        Marketiv
      </span>
    </div>
  );
}

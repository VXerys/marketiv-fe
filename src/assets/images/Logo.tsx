import Image from "next/image";
import { logoMarketivRemoveBgPng } from "@/assets/icons";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <Image
        src={logoMarketivRemoveBgPng}
        alt="Marketiv Logo"
        width={140}
        height={36}
        className="h-9 w-auto object-contain"
        priority
      />
    </div>
  );
}

"use client";

import { Users } from "lucide-react";

interface CreatorSummaryCardsProps {
  totalCreators: number;
}

export function CreatorSummaryCards({ totalCreators }: CreatorSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4">
      <div
        className="relative p-4 rounded-2xl sm:rounded-[22px] border border-neutral-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary-500/20 group select-none flex flex-col gap-3"
        style={{
          background: `radial-gradient(circle at 100% 0%, rgba(249,115,22,.05), transparent 10rem), linear-gradient(180deg, #ffffff, #fffdf9)`,
          boxShadow: "0 4px 14px rgba(15,23,42,.04)",
        }}
      >
        {/* Icon */}
        <div className="flex items-center justify-between">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-[13px] sm:rounded-[14px] grid place-items-center border transition-transform duration-300 group-hover:scale-105"
            style={{
              background: "#fff7ed",
              borderColor: "rgba(234,88,12,.18)",
              boxShadow: "0 3px 8px rgba(0,0,0,.04)",
            }}
          >
            <Users size={16} color="#ea580c" />
          </div>
        </div>

        <div>
          <span className="block text-[0.68rem] sm:text-[0.74rem] font-[800] text-neutral-500 tracking-wide uppercase mb-1 leading-none">
            Kreator Terdaftar
          </span>
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="font-display text-[1.2rem] sm:text-[1.45rem] font-black text-neutral-900 tracking-tight break-all leading-none">
              {totalCreators}
            </span>
            <span className="text-[0.68rem] sm:text-[0.74rem] font-semibold text-neutral-400">
              Kreator
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

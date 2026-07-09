"use client";

import { Users, ArrowLeftRight, Lock } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export function CreatorSummaryCards() {
  const stats = [
    {
      label: "Total Kreator Aktif",
      value: "142",
      suffix: "Kreator",
      icon: Users,
      color: "#ea580c",
      iconBg: "#fff7ed",
      iconBorder: "rgba(234,88,12,.18)",
      radialColor: "rgba(249,115,22,.05)",
    },
    {
      label: "Hubungan Negosiasi",
      value: "12",
      suffix: "Aktif",
      icon: ArrowLeftRight,
      color: "#2563eb",
      iconBg: "#f0f6ff",
      iconBorder: "rgba(37,99,235,.18)",
      radialColor: "rgba(37,99,235,.05)",
    },
    {
      label: "Escrow Terkunci",
      value: formatCurrency(4_500_000),
      suffix: "",
      icon: Lock,
      color: "#16a34a",
      iconBg: "#f1fbf5",
      iconBorder: "rgba(22,163,74,.18)",
      radialColor: "rgba(22,163,74,.05)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="relative p-4 rounded-2xl sm:rounded-[22px] border border-neutral-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary-500/20 group select-none flex flex-col gap-3"
            style={{
              background: `radial-gradient(circle at 100% 0%, ${stat.radialColor}, transparent 10rem), linear-gradient(180deg, #ffffff, #fffdf9)`,
              boxShadow: "0 4px 14px rgba(15,23,42,.04)",
            }}
          >
            {/* Icon */}
            <div className="flex items-center justify-between">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-[13px] sm:rounded-[14px] grid place-items-center border transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: stat.iconBg,
                  borderColor: stat.iconBorder,
                  boxShadow: "0 3px 8px rgba(0,0,0,.04)",
                }}
              >
                <Icon size={16} color={stat.color} />
              </div>
            </div>

            <div>
              <span className="block text-[0.68rem] sm:text-[0.74rem] font-[800] text-neutral-500 tracking-wide uppercase mb-1 leading-none">
                {stat.label}
              </span>
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="font-display text-[1.2rem] sm:text-[1.45rem] font-black text-neutral-900 tracking-tight break-all leading-none">
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-[0.68rem] sm:text-[0.74rem] font-semibold text-neutral-400">
                    {stat.suffix}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

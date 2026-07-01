"use client";

import { type MouseEvent, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ChartBarData } from "@/types/umkmDashboard";
import { DashboardCard } from "./DashboardCard";

const TIME_RANGE_OPTIONS = ["7 Hari Terakhir", "30 Hari Terakhir"] as const;

const CHART_DATA_30D: ChartBarData[] = [
  { day: "01-05", value: "95k", percent: 55, active: false },
  { day: "06-10", value: "115k", percent: 65, active: false },
  { day: "11-15", value: "140k", percent: 80, active: false },
  { day: "16-20", value: "130k", percent: 75, active: false },
  { day: "21-25", value: "165k", percent: 95, active: false },
  { day: "26-30", value: "184k", percent: 100, active: true },
  { day: "Hari Ini", value: "42k", percent: 30, active: false },
];

type TimeRangeOption = (typeof TIME_RANGE_OPTIONS)[number];

interface UmkmViewsChartCardProps {
  chartData: ChartBarData[];
}

export function UmkmViewsChartCard({ chartData }: UmkmViewsChartCardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeOption>("7 Hari Terakhir");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  const activeChartData = selectedTimeRange === "7 Hari Terakhir" ? chartData : CHART_DATA_30D;

  // click outside to close dropdown
  useEffect(() => {
    if (!isTimeDropdownOpen) return;
    const handleClose = () => setIsTimeDropdownOpen(false);
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [isTimeDropdownOpen]);

  const toggleDropdown = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsTimeDropdownOpen((isOpen) => !isOpen);
  };

  const handleSelect = (option: TimeRangeOption) => {
    setSelectedTimeRange(option);
    setIsTimeDropdownOpen(false);
  };

  return (
    <DashboardCard className="col-span-12 lg:col-span-7 relative group">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-50/40 pointer-events-none rounded-2xl z-0"></div>

      <div className="flex justify-between items-center mb-8 relative z-20">
        <div>
          <h3 className="text-lg text-neutral-900 font-extrabold">Performa Views</h3>
          <p className="text-xs text-neutral-400 mt-1 font-bold uppercase tracking-wider">Total akumulasi dari semua platform</p>
        </div>

        {/* Beautiful custom styled dropdown */}
        <div className="relative inline-block text-left">
          <button
            onClick={toggleDropdown}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all duration-300 rounded-full border cursor-pointer select-none",
              isTimeDropdownOpen
                ? "bg-primary-50 border-primary text-primary shadow-[0_0_12px_rgba(249,115,22,0.15)] scale-102"
                : "bg-bg-section/80 hover:bg-bg-section border-primary hover:border-primary-600 hover:shadow-sm text-neutral-700"
            )}
          >
            <span>{selectedTimeRange}</span>
            <svg
              className={cn(
                "w-3 h-3 transition-transform duration-300",
                isTimeDropdownOpen ? "rotate-180 text-primary" : "text-neutral-400"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu List */}
          {isTimeDropdownOpen && (
            <div
              className="absolute right-0 mt-2.5 w-48 origin-top-right rounded-2xl bg-bg-section border border-border-soft p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl z-30 animate-in fade-in slide-in-from-top-2 duration-200"
              onClick={(event) => event.stopPropagation()}
            >
              {TIME_RANGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between",
                    option === "30 Hari Terakhir" && "mt-1",
                    selectedTimeRange === option
                      ? "bg-primary-50 text-primary"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-primary"
                  )}
                >
                  <span>{option}</span>
                  {selectedTimeRange === option && (
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Grid & Rounded Bars */}
      <div className="h-56 w-full flex items-end justify-between gap-1.5 sm:gap-3 px-1 sm:px-2 mt-auto relative z-10">
        {/* Horizontal Dashed Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between z-0 pointer-events-none pb-8 opacity-25">
          <div className="w-full border-t border-dashed border-neutral-300"></div>
          <div className="w-full border-t border-dashed border-neutral-300"></div>
          <div className="w-full border-t border-dashed border-neutral-300"></div>
          <div className="w-full border-t border-dashed border-neutral-300"></div>
        </div>

        {/* Day Bars */}
        {activeChartData.map((bar) => (
          <div key={bar.day} className="w-full flex flex-col justify-end items-center group/bar relative h-full z-10">
            {/* Tooltip on Hover */}
            <div className={`absolute -top-10 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-300 transform group-hover/bar:-translate-y-1 shadow-lg font-bold after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent ${
              bar.active
                ? "bg-gradient-to-r from-primary to-primary-700 after:border-t-primary shadow-[0_4px_12px_rgba(249,115,22,0.3)]"
                : "bg-secondary-800 after:border-t-secondary-800"
            }`}>
              {bar.value}
            </div>

            {/* Bar graphic */}
            <div
              className={`chart-bar transition-all duration-300 rounded-t-xl ${
                bar.active
                  ? "bg-gradient-to-t from-primary-700 to-primary shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                  : ""
              }`}
              style={{ height: `${bar.percent}%` }}
            >
              {bar.active && (
                <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 -translate-x-full animate-[shimmer_3s_infinite]"></div>
              )}
            </div>

            {/* Day label */}
            <span className={`text-[10px] sm:text-[11px] mt-3 font-bold transition-all duration-200 ${
              bar.active
                ? "text-primary bg-primary-50 px-1.5 sm:px-2.5 py-0.5 rounded-full border border-primary-100/50"
                : "text-neutral-500"
            }`}>
              {bar.day}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

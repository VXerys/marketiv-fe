"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { LANDING_CONTENT } from "@/data/content";
import { cn } from "@/lib/utils";

const { transparency } = LANDING_CONTENT;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  }),
};

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const isApproved = status === "Approved";
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
        isApproved
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-amber-50 border-amber-200 text-amber-700"
      )}
    >
      {status}
    </span>
  );
}

export function TransparencySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeTab, setActiveTab] = useState("Semua");

  const { budgetCard, trackingCard } = transparency;

  const filteredRows =
    activeTab === "Semua"
      ? trackingCard.rows
      : trackingCard.rows.filter((r) => r.status === activeTab);

  return (
    <section
      ref={ref}
      id="transparansi"
      className="relative w-full py-20 md:py-28 bg-gradient-to-b from-white to-orange-50/30 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #f97316, transparent)" }}
      />

      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            custom={0}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-primary-700">{transparency.badge}</span>
          </motion.div>
          <motion.h2
            custom={0.1}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 leading-tight"
          >
            <span className="text-primary-500">{transparency.titleAccent}</span>
            <br />
            {transparency.titleMain}
          </motion.h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Budget Card */}
          <motion.div
            custom={0.2}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-neutral-900">{budgetCard.title}</h3>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-xs text-neutral-400 mb-0.5">{budgetCard.totalLabel}</p>
                <p className="text-2xl font-black text-neutral-900">{budgetCard.totalValue}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-400 mb-0.5">{budgetCard.remainingLabel}</p>
                <p className="text-2xl font-black text-primary-600">{budgetCard.remainingPercent}%</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="h-3 rounded-full bg-neutral-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${budgetCard.remainingPercent}%` } : {}}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                />
              </div>
              <p className="text-xs text-neutral-400 mt-1">{budgetCard.remainingPercent}% budget tersisa dari total</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: budgetCard.minViewLabel, value: budgetCard.minViewValue },
                { label: budgetCard.cpmLabel, value: budgetCard.cpmValue },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                  <p className="text-[10px] text-neutral-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-bold text-neutral-900">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tracking Card */}
          <motion.div
            custom={0.35}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900">{trackingCard.title}</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {trackingCard.tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  id={`transparency-tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer",
                    activeTab === tab
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-4 gap-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-2 px-2">
              <span>Kreator</span>
              <span className="text-right">Views</span>
              <span className="text-right">Payout</span>
              <span className="text-right">Status</span>
            </div>

            {/* Table Rows */}
            <div className="flex flex-col gap-1.5">
              {filteredRows.map((row, i) => (
                <motion.div
                  key={row.username}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="grid grid-cols-4 gap-2 items-center rounded-xl bg-neutral-50 border border-neutral-100 px-2 py-2.5"
                >
                  <span className="text-xs font-semibold text-neutral-800 truncate">{row.username}</span>
                  <span className="text-xs font-bold text-neutral-700 text-right">{row.views}</span>
                  <span className="text-xs font-bold text-primary-600 text-right">{row.payout}</span>
                  <div className="flex justify-end">
                    <StatusBadge status={row.status} />
                  </div>
                </motion.div>
              ))}
              {filteredRows.length === 0 && (
                <div className="py-8 text-center text-sm text-neutral-400">Tidak ada data untuk filter ini</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

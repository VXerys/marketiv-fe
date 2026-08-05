"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { LANDING_CONTENT } from "@/data/content";

const { estimator } = LANDING_CONTENT;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  }),
};

function formatViews(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "Jt";
  if (v >= 1_000) return (v / 1_000).toFixed(0) + "K";
  return v.toString();
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export function CuanEstimatorSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [views, setViews] = useState(estimator.sliderDefault);

  const estimatedPayout = Math.round((views / 1000) * estimator.cpmRate * 1000);

  return (
    <section ref={ref} id="estimator" className="relative w-full py-20 md:py-28 bg-gradient-to-b from-orange-50/30 to-white overflow-hidden">
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-1/2 opacity-30"
        style={{ background: "radial-gradient(ellipse at 0% 50%, #fff7ed, transparent 60%)" }}
      />

      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text Content */}
          <div>
            <motion.div
              custom={0}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={fadeUp}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5"
            >
              <span className="text-sm font-semibold text-primary-700">{estimator.badge}</span>
            </motion.div>

            <motion.h2
              custom={0.1}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={fadeUp}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 leading-tight"
            >
              <span className="text-primary-500">{estimator.titleAccent}</span>
              <br />
              <span className="text-neutral-600 font-normal text-xl sm:text-2xl">{estimator.titleMain}</span>
            </motion.h2>

            <motion.div
              custom={0.2}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={fadeUp}
              className="mt-8 flex flex-col gap-4"
            >
              <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5">
                <p className="text-sm font-medium text-primary-700">{estimator.totalBudgetText}</p>
                <p className="text-3xl font-black text-primary-600 mt-1">{estimator.totalBudget}</p>
                <p className="text-xs text-primary-500 mt-0.5">menunggu untuk diklaim oleh kreator</p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-600">{estimator.cpmLabel}</p>
                <p className="text-xl font-bold text-neutral-900 mt-0.5">{estimator.cpmValue}</p>
                <p className="text-xs text-neutral-400">{estimator.cpmNote}</p>
              </div>
            </motion.div>
          </div>

          {/* Right: Interactive Calculator */}
          <motion.div
            custom={0.3}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-primary-100/30 p-7"
          >
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-6">Kalkulator Penghasilan</p>

            {/* Slider */}
            <div className="mb-8">
              <div className="flex items-end justify-between mb-3">
                <span className="text-sm text-neutral-500">Estimasi Views</span>
                <span className="text-2xl font-black text-primary-600">{formatViews(views)}</span>
              </div>
              <div className="relative">
                <input
                  id="views-slider"
                  type="range"
                  min={estimator.sliderMin}
                  max={estimator.sliderMax}
                  step={1000}
                  value={views}
                  onChange={(e) => setViews(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${((views - estimator.sliderMin) / (estimator.sliderMax - estimator.sliderMin)) * 100}%, #e5e7eb ${((views - estimator.sliderMin) / (estimator.sliderMax - estimator.sliderMin)) * 100}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-1.5">
                  <span>1K views</span>
                  <span>1 Juta views</span>
                </div>
              </div>
            </div>

            {/* Result Display */}
            <motion.div
              key={estimatedPayout}
              initial={{ scale: 0.97, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-6 text-white text-center"
            >
              <p className="text-sm text-white/80 mb-2">
                {estimator.resultPrefix} <strong className="text-white">{formatViews(views)}</strong> {estimator.resultSuffix}
              </p>
              <p className="text-4xl font-black tracking-tight">{formatRupiah(estimatedPayout)}</p>
              <p className="text-xs text-white/60 mt-2">*estimasi berdasarkan CPM rata-rata Marketiv</p>
            </motion.div>

            {/* CPM breakdown */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-400">
              <span>Formula:</span>
              <span className="font-mono bg-neutral-100 rounded px-2 py-0.5 text-neutral-600">
                ({formatViews(views)} ÷ 1000) × Rp{estimator.cpmRate}.000
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

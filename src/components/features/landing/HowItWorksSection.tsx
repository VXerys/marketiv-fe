"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LANDING_CONTENT } from "@/data/content";

const { howItWorks } = LANDING_CONTENT;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  }),
};

function Step1Mockup() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-lg p-4 w-52">
        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide mb-3">Buat Campaign</p>
        <div className="flex flex-col gap-2">
          <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-2">
            <p className="text-[9px] text-neutral-400">Nama Produk</p>
            <p className="text-xs font-medium text-neutral-700">Kopi Nusantara Premium</p>
          </div>
          <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-2">
            <p className="text-[9px] text-neutral-400">Budget</p>
            <p className="text-xs font-medium text-neutral-700">Rp 5.000.000</p>
          </div>
        </div>
        <button className="mt-3 w-full rounded-lg bg-primary-500 py-2 text-xs font-bold text-white shadow shadow-primary-200 hover:bg-primary-600 transition-colors cursor-pointer">
          Buat Campaign →
        </button>
      </div>
    </div>
  );
}

function Step2Mockup() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-lg p-4 w-56">
        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide mb-3">Klaim & Submit</p>
        <div className="flex flex-col gap-2">
          {/* Campaign claim badge */}
          <div className="rounded-lg bg-primary-50 border border-primary-200 px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[9px] text-primary-500 font-medium">Campaign</p>
              <p className="text-xs font-bold text-neutral-800">Kopi Nusantara</p>
            </div>
            <div className="rounded-full bg-primary-500 px-2 py-0.5">
              <span className="text-[9px] font-bold text-white">Diklaim ✓</span>
            </div>
          </div>
          {/* TikTok submit URL */}
          <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-2">
            <p className="text-[9px] text-neutral-400 mb-0.5">Link Postingan TikTok</p>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-neutral-500 shrink-0">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.66a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.09z" />
              </svg>
              <p className="text-[10px] font-semibold text-primary-600 truncate">tiktok.com/@user/video/...</p>
            </div>
          </div>
          <button className="mt-1 w-full rounded-lg bg-primary-500 py-1.5 text-[10px] font-bold text-white hover:bg-primary-600 transition-colors cursor-pointer">
            Kirim Submission →
          </button>
        </div>
      </div>
    </div>
  );
}

function Step3Mockup() {
  const step = howItWorks.steps[2];
  return (
    <div className="flex items-center justify-center py-6">
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-lg p-4 w-52">
        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide mb-3">Verifikasi & Reward</p>
        {/* Fraud check row */}
        <div className="flex items-center justify-between rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-1.5 mb-2">
          <span className="text-[9px] text-neutral-500">Cek keaslian konten</span>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-700">✓ Lolos</span>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 p-3 text-white">
          <div className="flex justify-between mb-2">
            <div>
              <p className="text-[9px] text-white/70">Views</p>
              <div className="flex items-center gap-1 mt-0.5">
                <svg viewBox="0 0 8 8" className="h-2 w-2 fill-white">
                  <path d="M1.5 1 L6 4 L1.5 7 Z" />
                </svg>
                <span className="text-sm font-bold">{step.mockupViews}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-white/70">Reward Masuk</p>
              <p className="text-sm font-bold text-emerald-300 mt-0.5">{step.mockupPayout}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-neutral-500">Status</span>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[9px] font-bold text-emerald-700">
            ✓ {step.mockupStatus}
          </span>
        </div>
      </div>
    </div>
  );
}

const stepMockups = [<Step1Mockup key={1} />, <Step2Mockup key={2} />, <Step3Mockup key={3} />];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="cara-kerja"
      className="relative w-full py-20 md:py-28 bg-gradient-to-b from-orange-50/40 to-white overflow-hidden"
    >
      {/* Subtle top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            custom={0}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5"
          >
            <span className="text-sm font-semibold text-primary-700">{howItWorks.badge}</span>
          </motion.div>
          <motion.h2
            custom={0.1}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 leading-tight"
          >
            <span className="text-primary-500">{howItWorks.titleAccent}</span>
            <br />
            <span className="text-neutral-500 font-normal text-2xl sm:text-3xl md:text-4xl">{howItWorks.titleMain}</span>
          </motion.h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {howItWorks.steps.map((step, i) => (
            <motion.div
              key={step.id}
              custom={0.1 + i * 0.15}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={fadeUp}
              className="relative flex flex-col rounded-3xl border border-neutral-200 bg-neutral-50 overflow-hidden hover:shadow-lg hover:shadow-primary-100/50 transition-shadow duration-300"
            >
              {/* Step number badge */}
              <div className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white shadow shadow-primary-300/50">
                {step.id}
              </div>

              {/* Mockup area */}
              <div className="bg-white border-b border-neutral-100">{stepMockups[i]}</div>

              {/* Text */}
              <div className="p-5 pt-4">
                <h3 className="text-lg font-bold text-neutral-900">{step.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">{step.description}</p>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LANDING_CONTENT } from "@/data/content";

const { features } = LANDING_CONTENT;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  }),
};

function CheckIcon() {
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100">
      <svg className="h-2.5 w-2.5 text-primary-600" fill="currentColor" viewBox="0 0 12 12">
        <path d="M10.28 2.28L4 8.56 1.72 6.28a1 1 0 00-1.44 1.44l3 3a1 1 0 001.44 0l7-7a1 1 0 00-1.44-1.44z" />
      </svg>
    </div>
  );
}

function CampaignIcon() {
  return (
    <svg className="h-7 w-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function RateCardIcon() {
  return (
    <svg className="h-7 w-7 text-navy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="fitur"
      className="relative w-full py-20 md:py-28 bg-gradient-to-b from-white to-orange-50/30 overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #f97316, transparent)" }} />

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
            <span className="text-sm font-semibold text-primary-700">{features.badge}</span>
          </motion.div>
          <motion.h2
            custom={0.1}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 leading-tight"
          >
            <span className="text-primary-500">{features.titleAccent}</span>
            <br />
            {features.titleMain}
          </motion.h2>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Campaign Mode Card */}
          <motion.div
            custom={0.2}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="group relative rounded-3xl border border-primary-100 bg-white p-8 shadow-sm hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Background accent */}
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
              style={{ background: "radial-gradient(circle, #f97316, transparent)" }} />

            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-200 px-3 py-1 mb-5">
              <CampaignIcon />
              <span className="text-sm font-bold text-primary-700">{features.campaign.tag}</span>
            </div>

            <h3 className="text-2xl font-bold text-neutral-900 mb-3">{features.campaign.title}</h3>
            <p className="text-neutral-500 leading-relaxed mb-6">{features.campaign.description}</p>

            <ul className="flex flex-col gap-3">
              {features.campaign.points.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm font-medium text-neutral-700">
                  <CheckIcon />
                  {point}
                </li>
              ))}
            </ul>

            {/* Bottom gradient bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          {/* Rate Card Mode Card */}
          <motion.div
            custom={0.35}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="group relative rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm hover:shadow-xl hover:shadow-navy-100/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Background accent */}
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
              style={{ background: "radial-gradient(circle, #1e3a5f, transparent)" }} />

            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 border border-navy-100 px-3 py-1 mb-5"
              style={{ background: "rgba(30,58,95,0.05)", borderColor: "rgba(30,58,95,0.15)" }}>
              <RateCardIcon />
              <span className="text-sm font-bold" style={{ color: "#1e3a5f" }}>{features.rateCard.tag}</span>
            </div>

            <h3 className="text-2xl font-bold text-neutral-900 mb-3">{features.rateCard.title}</h3>
            <p className="text-neutral-500 leading-relaxed mb-6">{features.rateCard.description}</p>

            <ul className="flex flex-col gap-3">
              {features.rateCard.points.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm font-medium text-neutral-700">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "rgba(30,58,95,0.08)" }}>
                    <svg className="h-2.5 w-2.5" fill="#1e3a5f" viewBox="0 0 12 12">
                      <path d="M10.28 2.28L4 8.56 1.72 6.28a1 1 0 00-1.44 1.44l3 3a1 1 0 001.44 0l7-7a1 1 0 00-1.44-1.44z" />
                    </svg>
                  </div>
                  {point}
                </li>
              ))}
            </ul>

            {/* Bottom gradient bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(to right, #1e3a5f, #12213a)" }} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

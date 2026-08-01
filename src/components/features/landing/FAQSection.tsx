"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { LANDING_CONTENT } from "@/data/content";
import { cn } from "@/lib/utils";

const { faq } = LANDING_CONTENT;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  }),
};

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function AccordionItem({ question, answer, isOpen, onToggle, index }: AccordionItemProps) {
  return (
    <motion.div
      custom={0.05 * index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className={cn(
        "rounded-2xl border transition-all duration-300 overflow-hidden",
        isOpen ? "border-primary-200 bg-primary-50/50 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"
      )}
    >
      <button
        type="button"
        id={`faq-item-${index}`}
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className={cn("text-base font-semibold leading-snug", isOpen ? "text-primary-700" : "text-neutral-900")}>
          {question}
        </span>
        <div
          className={cn(
            "ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300",
            isOpen ? "bg-primary-500 rotate-45" : "bg-neutral-100 rotate-0"
          )}
        >
          <svg
            className={cn("h-3.5 w-3.5 transition-colors duration-300", isOpen ? "text-white" : "text-neutral-500")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-neutral-600 leading-relaxed border-t border-primary-100/60 pt-3">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section ref={ref} id="faq" className="relative w-full py-20 md:py-28 bg-gradient-to-b from-orange-50/30 to-white overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, #fed7aa, transparent)" }}
      />

      <div className="mx-auto max-w-3xl px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            custom={0}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5"
          >
            <span className="text-sm font-semibold text-primary-700">{faq.badge}</span>
          </motion.div>
          <motion.h2
            custom={0.1}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-bold text-neutral-900"
          >
            {faq.title}
          </motion.h2>
        </div>

        {/* FAQ Items */}
        <div className="flex flex-col gap-3">
          {faq.items.map((item, i) => (
            <AccordionItem
              key={item.q}
              index={i}
              question={item.q}
              answer={item.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

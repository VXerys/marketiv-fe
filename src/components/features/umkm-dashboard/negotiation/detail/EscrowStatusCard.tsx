"use client";

import { cn } from "@/lib/utils";
import { ESCROW_STEPS } from "../negotiation.constants";
import { getStepStatus } from "../negotiation.utils";

interface EscrowStatusCardProps {
  orderStatus: string;
}

export function EscrowStatusCard({ orderStatus }: EscrowStatusCardProps) {
  const steps = ESCROW_STEPS;

  return (
    <div className="rounded-2xl border border-border-soft bg-white p-5 space-y-4 select-none shadow-2xs">
      {/* Card header */}
      <div className="flex items-center gap-2 border-b border-border-soft pb-3">
        <div className="h-7 w-7 rounded-lg bg-success/10 border border-success/15 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
          Tahapan Aliran Dana Escrow
        </span>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const status = getStepStatus(idx, orderStatus);
          const isCompleted = status === "completed";
          const isActive = status === "active";
          const isDispute = status === "dispute";

          return (
            <div key={idx} className="flex gap-3">
              {/* Connector dots */}
              <div className="flex flex-col items-center shrink-0">
                {isCompleted ? (
                  <span className="h-5 w-5 rounded-full bg-success text-white flex items-center justify-center text-[9px] border-2 border-white shadow-[0_0_0_2px_rgba(34,197,94,.2)]">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : isDispute ? (
                  <span className="h-5 w-5 rounded-full bg-danger text-white flex items-center justify-center text-[9px] font-extrabold border-2 border-white shadow-[0_0_0_2px_rgba(239,68,68,.2)]">!</span>
                ) : isActive ? (
                  <span className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-extrabold border-2 border-white shadow-[0_0_0_2px_rgba(249,115,22,.25)] animate-pulse">
                    {idx + 1}
                  </span>
                ) : (
                  <span className="h-5 w-5 rounded-full border-2 border-neutral-200 bg-neutral-50 flex items-center justify-center text-[9px] font-bold text-text-muted">
                    {idx + 1}
                  </span>
                )}
                
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "w-0.5 h-6 my-1 rounded-full",
                    isCompleted ? "bg-success" : "bg-neutral-200"
                  )} />
                )}
              </div>

              {/* Text labels */}
              <div className="min-w-0 pt-0.5">
                <span className={cn(
                  "block text-[11px] font-extrabold leading-none",
                  isActive ? "text-primary" : isCompleted ? "text-text-primary" : isDispute ? "text-danger" : "text-text-muted"
                )}>
                  {step.label}
                </span>
                <span className="block text-[8px] text-text-muted mt-1 font-semibold leading-tight">
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

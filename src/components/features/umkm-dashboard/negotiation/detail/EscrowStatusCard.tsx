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
    <div className="rounded-2xl border border-border-soft bg-white p-5 space-y-4 shadow-2xs select-none">
      <div className="flex items-center gap-2 border-b border-border-soft pb-3">
        <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
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
                  <span className="h-4.5 w-4.5 rounded-full bg-success text-white flex items-center justify-center text-[9px] border border-white shadow-2xs">
                    ✓
                  </span>
                ) : isDispute ? (
                  <span className="h-4.5 w-4.5 rounded-full bg-danger text-white flex items-center justify-center text-[9px] border border-white shadow-2xs">
                    !
                  </span>
                ) : isActive ? (
                  <span className="h-4.5 w-4.5 rounded-full bg-primary text-white flex items-center justify-center text-[9px] border border-white shadow-2xs animate-pulse font-extrabold">
                    {idx + 1}
                  </span>
                ) : (
                  <span className="h-4.5 w-4.5 rounded-full border-2 border-neutral-300 bg-white flex items-center justify-center text-[9px] font-bold text-text-muted">
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

"use client";

import { cn } from "@/lib/utils";

interface DealChecklistCardProps {
  orderStatus: string;
}

export function DealChecklistCard({ orderStatus }: DealChecklistCardProps) {
  const isNegotiating = orderStatus === "negotiation";
  
  const checklist = [
    { label: "Scope Pekerjaan Jelas", checked: true },
    { label: "Harga Disepakati", checked: !isNegotiating },
    { label: "Deadline Disepakati", checked: !isNegotiating },
    { label: "Collab Post Instagram/TikTok", checked: true },
    { label: "Dana Escrow Siap", checked: !isNegotiating && orderStatus !== "waiting_payment" },
  ];

  return (
    <div className="rounded-2xl border border-border-soft bg-white p-5 space-y-4 shadow-2xs select-none">
      <div className="flex items-center gap-2 border-b border-border-soft pb-3">
        <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
          Persetujuan Syarat (Deal)
        </span>
      </div>

      <ul className="space-y-2.5">
        {checklist.map((item, idx) => (
          <li key={idx} className="flex gap-2.5 items-center text-[10px] font-semibold leading-tight">
            {item.checked ? (
              <span className="h-4 w-4 rounded-full bg-success-soft/35 text-success flex items-center justify-center shrink-0 text-[8px] font-bold">
                ✓
              </span>
            ) : (
              <span className="h-4 w-4 rounded-full border border-neutral-300 bg-white flex items-center justify-center shrink-0 text-[8px] font-bold text-text-muted">
                &minus;
              </span>
            )}
            <span className={cn(
              item.checked ? "text-text-primary" : "text-text-muted"
            )}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

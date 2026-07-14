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

  const checkedCount = checklist.filter((i) => i.checked).length;
  const totalCount = checklist.length;

  return (
    <div className="rounded-2xl border border-border-soft bg-white p-5 space-y-4 select-none shadow-2xs">
      {/* Card header */}
      <div className="flex items-center justify-between gap-2 border-b border-border-soft pb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-success/10 border border-success/15 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
            Persetujuan Syarat (Deal)
          </span>
        </div>
        <span className="text-[9px] font-bold text-text-muted">
          {checkedCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-success rounded-full transition-all duration-500"
          style={{ width: `${(checkedCount / totalCount) * 100}%` }}
        />
      </div>

      <ul className="space-y-2.5">
        {checklist.map((item, idx) => (
          <li key={idx} className="flex gap-2.5 items-center text-[10px] font-semibold leading-tight">
            {item.checked ? (
              <span className="h-4 w-4 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </span>
            ) : (
              <span className="h-4 w-4 rounded-full border-2 border-neutral-200 bg-neutral-50 flex items-center justify-center shrink-0 text-[8px] font-bold text-text-muted">
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

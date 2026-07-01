import { useState } from "react";
import { FormSectionCard } from "../cards/FormSectionCard";
import { BudgetCalculatorCard } from "../cards/BudgetCalculatorCard";
import { formatCurrency } from "@/lib/formatters";
import { PRICE_TIERS } from "../create-campaign.constants";

interface BudgetQuotaStepProps {
  pricePerThousandViews: number;
  onChangePricePerThousandViews: (val: number) => void;
  totalBudgetEscrow: number;
  onChangeTotalBudgetEscrow: (val: number) => void;
  creatorQuota: number;
  onChangeCreatorQuota: (val: number) => void;
  validationErrors?: Record<string, string>;
}

export function BudgetQuotaStep({
  pricePerThousandViews,
  onChangePricePerThousandViews,
  totalBudgetEscrow,
  onChangeTotalBudgetEscrow,
  creatorQuota,
  onChangeCreatorQuota,
  validationErrors = {},
}: BudgetQuotaStepProps) {
  const [customPriceActive, setCustomPriceActive] = useState(
    ![3000, 5000, 8000].includes(pricePerThousandViews)
  );

  const handlePriceSelect = (price: number) => {
    setCustomPriceActive(false);
    onChangePricePerThousandViews(price);
  };

  const handleCustomPriceSelect = () => {
    setCustomPriceActive(true);
    onChangePricePerThousandViews(10000); // default custom
  };

  const incrementQuota = () => {
    onChangeCreatorQuota(creatorQuota + 1);
  };

  const decrementQuota = () => {
    if (creatorQuota > 1) {
      onChangeCreatorQuota(creatorQuota - 1);
    }
  };

  return (
    <FormSectionCard
      title="Budget & Kuota Kreator"
      description="Atur bayaran per tayangan video, kuota jumlah kreator, serta amankan anggaran dana escrow kampanye Anda."
      icon={
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
    >
      {/* Price tier selection */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
          Bayaran per 1.000 Views <span className="text-primary">*</span>
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRICE_TIERS.map((tier) => {
            const isSelected = !customPriceActive && pricePerThousandViews === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => handlePriceSelect(tier.id)}
                className={`w-full p-3 rounded-xl border text-left flex flex-col justify-between min-h-[85px] transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-primary-50/40 border-primary shadow-[0_8px_20px_-8px_rgba(235,94,40,0.15)] scale-[1.01]"
                    : "bg-white border-neutral-200/60 hover:bg-neutral-50 hover:border-neutral-300"
                }`}
              >
                <span className={`block text-xs font-extrabold ${isSelected ? "text-primary" : "text-text-primary"}`}>
                  {tier.label}
                </span>
                <span className="block text-[8px] text-text-muted mt-1 leading-tight font-semibold">
                  {tier.desc}
                </span>
              </button>
            );
          })}
          
          {/* Custom option */}
          <button
            type="button"
            onClick={handleCustomPriceSelect}
            className={`w-full p-3 rounded-xl border text-left flex flex-col justify-between min-h-[85px] transition-all duration-200 cursor-pointer ${
              customPriceActive
                ? "bg-primary-50/40 border-primary shadow-[0_8px_20px_-8px_rgba(235,94,40,0.15)] scale-[1.01]"
                : "bg-white border-neutral-200/60 hover:bg-neutral-50 hover:border-neutral-300"
            }`}
          >
            <span className={`block text-xs font-extrabold ${customPriceActive ? "text-primary" : "text-text-primary"}`}>
              Kustom
            </span>
            <span className="block text-[8px] text-text-muted mt-1 leading-tight font-semibold">
              Atur bayaran khusus Anda
            </span>
          </button>
        </div>

        {/* Input box for Custom Price */}
        {customPriceActive && (
          <div className="mt-3 max-w-xs space-y-1.5 animate-in fade-in duration-200">
            <span className="block text-[9px] font-bold text-text-muted uppercase">Bayaran Kustom (Rupiah)</span>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-text-muted">Rp</span>
              <input
                type="number"
                min={1000}
                placeholder="10000"
                value={pricePerThousandViews}
                onChange={(e) => onChangePricePerThousandViews(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 text-xs text-text-primary border border-border-strong rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <p className="text-[9px] text-text-muted">Minimal bayaran kustom Rp 1.000 per 1.000 views.</p>
          </div>
        )}
        
        {validationErrors.pricePerThousandViews && (
          <p className="text-[10px] text-danger font-bold">{validationErrors.pricePerThousandViews}</p>
        )}
      </div>

      {/* Quota limit selector */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
          Kuota Rekrutmen Kreator <span className="text-primary">*</span>
        </label>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border-strong rounded-xl overflow-hidden bg-neutral-50/50">
            <button
              type="button"
              onClick={decrementQuota}
              className="h-10 w-10 flex items-center justify-center font-bold hover:bg-neutral-100 cursor-pointer select-none text-text-secondary"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              value={creatorQuota}
              onChange={(e) => onChangeCreatorQuota(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-10 w-16 text-center bg-transparent text-xs font-bold text-text-primary focus:outline-none border-x border-border-strong [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={incrementQuota}
              className="h-10 w-10 flex items-center justify-center font-bold hover:bg-neutral-100 cursor-pointer select-none text-text-secondary"
            >
              +
            </button>
          </div>
          <span className="text-[10px] text-text-muted leading-tight font-semibold">
            Maksimal jumlah kreator unik yang diperbolehkan mengklaim job ini.
          </span>
        </div>
        {validationErrors.creatorQuota && (
          <p className="text-[10px] text-danger font-bold">{validationErrors.creatorQuota}</p>
        )}
      </div>

      {/* Budget Escrow Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="total-budget" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            Total Anggaran Kampanye (Escrow) <span className="text-primary">*</span>
          </label>
          <span className="text-xs font-extrabold text-primary bg-primary-soft/10 px-2 py-0.5 rounded-md border border-primary-100/10">
            {formatCurrency(totalBudgetEscrow)}
          </span>
        </div>
        
        {/* Slider input */}
        <div className="flex items-center gap-4">
          <input
            id="total-budget-slider"
            type="range"
            min={100000}
            max={10000000}
            step={50000}
            value={totalBudgetEscrow}
            onChange={(e) => onChangeTotalBudgetEscrow(parseInt(e.target.value) || 0)}
            className="flex-1 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="relative flex items-center w-36 shrink-0">
            <span className="absolute left-3 text-xs font-bold text-text-muted">Rp</span>
            <input
              id="total-budget"
              type="number"
              min={100000}
              placeholder="3200000"
              value={totalBudgetEscrow}
              onChange={(e) => onChangeTotalBudgetEscrow(Math.max(0, parseInt(e.target.value) || 0))}
              className={`w-full pl-9 pr-3 py-2 bg-neutral-50 text-xs font-bold text-text-primary border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                validationErrors.totalBudgetEscrow ? "border-danger focus:ring-danger" : "border-border-strong"
              }`}
            />
          </div>
        </div>
        {validationErrors.totalBudgetEscrow ? (
          <p className="text-[10px] text-danger font-bold">{validationErrors.totalBudgetEscrow}</p>
        ) : (
          <p className="text-[10px] text-text-muted">Masukkan total nominal dana yang ingin dialokasikan untuk penayangan views kreator.</p>
        )}
      </div>

      {/* Embedded Cost Calculations Breakdown Panel */}
      <BudgetCalculatorCard
        pricePerThousandViews={pricePerThousandViews}
        totalBudgetEscrow={totalBudgetEscrow}
        creatorQuota={creatorQuota}
      />

      {/* Premium Visual Escrow Flow Diagram */}
      <div className="rounded-2xl border border-primary-100/50 bg-primary-50/15 p-5 space-y-3.5">
        <span className="block text-[10px] font-extrabold text-primary uppercase tracking-wider">
          Alur Rekening Escrow Keuangan Marketiv
        </span>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center text-[10px] font-bold">
          
          <div className="bg-white p-3.5 rounded-xl border border-neutral-200/50 shadow-2xs space-y-1.5 flex-1 w-full sm:w-auto">
            <div className="h-6 w-6 rounded-full bg-primary-50 text-primary flex items-center justify-center text-[9px] font-extrabold mx-auto shadow-2xs">
              01
            </div>
            <span className="block font-extrabold text-text-primary text-[10px]">UMKM Transfer</span>
            <span className="block text-[8px] text-text-muted leading-tight font-medium">
              Anggaran didepositkan & diamankan sebelum rilis.
            </span>
          </div>
          
          <div className="flex flex-row sm:flex-col justify-center items-center shrink-0">
            <svg className="w-5 h-5 text-primary shrink-0 rotate-90 sm:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="text-[8px] font-extrabold text-primary uppercase mt-1">Escrow Lock</span>
          </div>
          
          <div className="bg-white p-3.5 rounded-xl border border-neutral-200/50 shadow-2xs space-y-1.5 flex-1 w-full sm:w-auto">
            <div className="h-6 w-6 rounded-full bg-success-soft text-success-strong flex items-center justify-center text-[9px] font-extrabold mx-auto shadow-2xs">
              02
            </div>
            <span className="block font-extrabold text-text-primary text-[10px]">Kreator Rilis</span>
            <span className="block text-[8px] text-text-muted leading-tight font-medium">
              Dana dicairkan setelah bukti tayang konten valid.
            </span>
          </div>

        </div>
      </div>

    </FormSectionCard>
  );
}

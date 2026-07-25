"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Subcomponents & steps
import { CampaignWizardHeader } from "./CampaignWizardHeader";
import { CampaignWizardStepper } from "./CampaignWizardStepper";
import { CampaignWizardLayout } from "./CampaignWizardLayout";
import { CampaignWizardFooter } from "./CampaignWizardFooter";
import { CampaignLivePreviewCard } from "./CampaignLivePreviewCard";
import { CampaignHealthChecklist } from "./CampaignHealthChecklist";

import { ProductInfoStep } from "./steps/ProductInfoStep";
import { BriefGuidelineStep } from "./steps/BriefGuidelineStep";
import { AssetLinkStep } from "./steps/AssetLinkStep";
import { BudgetQuotaStep } from "./steps/BudgetQuotaStep";
import { ReviewEscrowStep } from "./steps/ReviewEscrowStep";

// Cards & helpers
import { BriefQualityCard } from "./cards/BriefQualityCard";
import { BudgetCalculatorCard } from "./cards/BudgetCalculatorCard";
import { CampaignWizardState } from "./types";
import { validateStepFields, isStepCompleted } from "./create-campaign.validation";
import { TONE_OPTIONS, CTA_OPTIONS } from "./create-campaign.constants";
import { composeBriefDetail, packDoAndDontJson } from "@/lib/validations/campaign.schema";
import {
  createCampaignDraft,
  generateCampaignBrief,
} from "@/services/umkm/umkm-dashboard.service";
import type { CampaignType } from "@/types/domain";
import { toast } from "sonner";

// Modals
import { SaveDraftModal } from "./modals/SaveDraftModal";
import { PaymentSimulationModal } from "./modals/PaymentSimulationModal";
import { CampaignCreatedModal } from "./modals/CampaignCreatedModal";

export function CreateCampaignWizard() {
  const router = useRouter();

  // Wizard state machine
  const [currentStep, setCurrentStep] = useState(1);
  const stepsCount = 5;

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [brief, setBrief] = useState("");
  const [videoStyle, setVideoStyle] = useState("");
  const [requiredPoints, setRequiredPoints] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [externalAssetUrl, setExternalAssetUrl] = useState("");
  const [assetNotes, setAssetNotes] = useState("");
  const [pricePerThousandViews, setPricePerThousandViews] = useState(5000);
  const [totalBudgetEscrow, setTotalBudgetEscrow] = useState(3200000);
  const [creatorQuota, setCreatorQuota] = useState(4);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [stepValidationTried, setStepValidationTried] = useState<Record<number, boolean>>({});

  // AI brief state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  /** Diisi hasil AI agar ikut tersimpan ke campaign_briefs saat draft dibuat. */
  const [aiObjective, setAiObjective] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);

  // Modals state
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCreatedOpen, setIsCreatedOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unified wizard state object
  const wizardState: CampaignWizardState = {
    title,
    category,
    type,
    description,
    location,
    brief,
    videoStyle,
    requiredPoints,
    callToAction,
    hashtags,
    externalAssetUrl,
    assetNotes,
    pricePerThousandViews,
    totalBudgetEscrow,
    creatorQuota,
    termsAgreed,
  };

  // Real-time validations for checklist markers using validation helpers
  const productInfoValid = isStepCompleted(1, wizardState);
  const briefValid = isStepCompleted(2, wizardState);
  const assetValid = isStepCompleted(3, wizardState);
  const budgetValid = isStepCompleted(4, wizardState);
  const reviewValid = isStepCompleted(5, wizardState);

  // Validate step specific fields using validation helpers
  const validateStep = (step: number): boolean => {
    const errs = validateStepFields(step, wizardState);
    setValidationErrors(errs);
    setStepValidationTried((prev) => ({ ...prev, [step]: true }));
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < stepsCount) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Last step: open payment simulation modal
        setIsPaymentOpen(true);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveDraft = () => {
    setIsDraftOpen(true);
  };

  /**
   * Aksi eksplisit "Bantu dengan AI". Mengisi brief + poin wajib; TIDAK menimpa
   * videoStyle/callToAction karena itu pilihan enumerated user (AI mengembalikan
   * prosa, bukan id opsi).
   */
  const handleGenerateAiBrief = async () => {
    if (brief.trim() && !window.confirm("Brief yang sudah Anda tulis akan ditimpa. Lanjutkan?")) {
      return;
    }
    setAiError(null);
    setIsGeneratingAi(true);
    const res = await generateCampaignBrief({
      description,
      type: (type as CampaignType) || "ugc",
      productName: title || undefined,
      targetMarket: location || undefined,
      goal: CTA_OPTIONS.find((o) => o.id === callToAction)?.label,
      materials: externalAssetUrl.trim() ? [externalAssetUrl.trim()] : [],
    });
    setIsGeneratingAi(false);

    if (!res.success || !res.data) {
      setAiError(
        res.code === "validation"
          ? res.error ?? "Data belum cukup untuk menyusun brief."
          : "Layanan AI sedang tidak tersedia. Coba lagi nanti."
      );
      return;
    }

    const ai = res.data;
    setBrief(ai.briefDetail);
    setRequiredPoints(
      [
        ...ai.doAndDont.do.map((d) => `- ${d}`),
        ...ai.doAndDont.dont.map((d) => `- Dilarang: ${d}`),
      ].join("\n")
    );
    setAiObjective(ai.objective);
    setAiGenerated(true);
  };

  const handleConfirmDraft = async () => {
    // Kolom wajib campaigns (title/category/type/description) = langkah 1.
    if (!isStepCompleted(1, wizardState)) {
      setIsDraftOpen(false);
      setCurrentStep(1);
      validateStep(1);
      toast.error("Lengkapi Informasi Produk (langkah 1) sebelum menyimpan draft.");
      return;
    }

    setIsDraftOpen(false);
    setIsSubmitting(true);

    const tone = TONE_OPTIONS.find((o) => o.id === videoStyle);
    const ctaOpt = CTA_OPTIONS.find((o) => o.id === callToAction);

    const res = await createCampaignDraft({
      title,
      category,
      type: type as CampaignType,
      description,
      budget: totalBudgetEscrow,
      rewardPer1000Views: pricePerThousandViews,
      claimLimit: creatorQuota,
      brief: {
        briefDetail: composeBriefDetail({ brief, requiredPoints, hashtags, location, assetNotes }),
        contentAngle: tone ? `${tone.label} — ${tone.desc}` : videoStyle,
        cta: ctaOpt ? ctaOpt.label : callToAction,
        doAndDont: requiredPoints.trim() ? packDoAndDontJson(requiredPoints) : "",
        objective: aiObjective || undefined,
        generatedByAi: aiGenerated,
      },
      asset: externalAssetUrl.trim() ? { fileUrl: externalAssetUrl.trim() } : undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      if (res.data.warnings.length > 0) {
        res.data.warnings.forEach((w) => toast.warning(w));
      } else {
        toast.success("Draft campaign berhasil disimpan.");
      }
      router.push("/dashboard/umkm/campaign");
      return;
    }

    toast.error(
      res.code === "auth"
        ? "Sesi berakhir, silakan login kembali."
        : res.error ?? "Gagal menyimpan draft. Coba lagi."
    );
  };

  const handleConfirmPayment = () => {
    setIsPaymentOpen(false);
    setIsSubmitting(true);
    // Simulate payment API transaction time
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCreatedOpen(true);
    }, 1500);
  };

  const handleSuccessRedirect = () => {
    setIsCreatedOpen(false);
    router.push("/dashboard/umkm/campaign");
  };

  const handleResetWizard = () => {
    setIsCreatedOpen(false);
    setCurrentStep(1);
    setTitle("");
    setCategory("");
    setType("");
    setDescription("");
    setLocation("");
    setBrief("");
    setVideoStyle("");
    setRequiredPoints("");
    setCallToAction("");
    setHashtags("");
    setExternalAssetUrl("");
    setAssetNotes("");
    setPricePerThousandViews(5000);
    setTotalBudgetEscrow(3200000);
    setCreatorQuota(4);
    setTermsAgreed(false);
    setValidationErrors({});
    setStepValidationTried({});
    setAiError(null);
    setAiObjective("");
    setAiGenerated(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render current active step form content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProductInfoStep
            title={title}
            onChangeTitle={setTitle}
            category={category}
            onChangeCategory={setCategory}
            type={type}
            onChangeType={setType}
            description={description}
            onChangeDescription={setDescription}
            location={location}
            onChangeLocation={setLocation}
            validationErrors={validationErrors}
          />
        );
      case 2:
        return (
          <BriefGuidelineStep
            brief={brief}
            onChangeBrief={setBrief}
            videoStyle={videoStyle}
            onChangeVideoStyle={setVideoStyle}
            requiredPoints={requiredPoints}
            onChangeRequiredPoints={setRequiredPoints}
            callToAction={callToAction}
            onChangeCallToAction={setCallToAction}
            hashtags={hashtags}
            onChangeHashtags={setHashtags}
            validationErrors={validationErrors}
            onGenerateAi={handleGenerateAiBrief}
            isGeneratingAi={isGeneratingAi}
            aiError={aiError}
            canGenerateAi={description.trim().length >= 30}
          />
        );
      case 3:
        return (
          <AssetLinkStep
            externalAssetUrl={externalAssetUrl}
            onChangeExternalAssetUrl={setExternalAssetUrl}
            assetNotes={assetNotes}
            onChangeAssetNotes={setAssetNotes}
            validationErrors={validationErrors}
          />
        );
      case 4:
        return (
          <BudgetQuotaStep
            pricePerThousandViews={pricePerThousandViews}
            onChangePricePerThousandViews={setPricePerThousandViews}
            totalBudgetEscrow={totalBudgetEscrow}
            onChangeTotalBudgetEscrow={setTotalBudgetEscrow}
            creatorQuota={creatorQuota}
            onChangeCreatorQuota={setCreatorQuota}
            validationErrors={validationErrors}
          />
        );
      case 5:
        return (
          <ReviewEscrowStep
            title={title}
            category={category}
            description={description}
            brief={brief}
            videoStyle={videoStyle}
            requiredPoints={requiredPoints}
            callToAction={callToAction}
            hashtags={hashtags}
            externalAssetUrl={externalAssetUrl}
            pricePerThousandViews={pricePerThousandViews}
            totalBudgetEscrow={totalBudgetEscrow}
            creatorQuota={creatorQuota}
            termsAgreed={termsAgreed}
            onChangeTermsAgreed={setTermsAgreed}
            validationErrors={validationErrors}
          />
        );
      default:
        return null;
    }
  };

  // Render sidebar contents dynamically based on active step status
  const renderSidebar = () => {
    return (
      <div className="space-y-4">
        {/* Live Preview Card (Always rendered to show visual progress) */}
        <CampaignLivePreviewCard
          title={title}
          category={category}
          brief={brief}
          pricePerThousandViews={pricePerThousandViews}
          totalBudgetEscrow={totalBudgetEscrow}
          creatorQuota={creatorQuota}
        />

        {/* Dynamic Insight Indicators */}
        {currentStep === 2 && (
          <BriefQualityCard
            campaignTitle={title}
            productCategory={category}
            productDescription={description}
            mainBrief={brief}
            callToAction={callToAction}
            externalAssetUrl={externalAssetUrl}
          />
        )}

        {currentStep === 4 && (
          <BudgetCalculatorCard
            pricePerThousandViews={pricePerThousandViews}
            totalBudgetEscrow={totalBudgetEscrow}
            creatorQuota={creatorQuota}
          />
        )}

        {/* Step Health Check indicator list */}
        <CampaignHealthChecklist
          currentStep={currentStep}
          productInfoValid={productInfoValid}
          briefValid={briefValid}
          assetValid={assetValid}
          budgetValid={budgetValid}
          reviewValid={reviewValid}
          stepValidationTried={stepValidationTried}
        />
      </div>
    );
  };

  return (
    <div className="pb-6 relative">
      {/* Wizard Header */}
      <CampaignWizardHeader
        onSaveDraft={handleSaveDraft}
        onCancel={() => router.push("/dashboard/umkm/campaign")}
      />

      {/* Wizard Stepper Checkpoints */}
      <CampaignWizardStepper
        currentStep={currentStep}
        stepsCount={stepsCount}
        productInfoValid={productInfoValid}
        briefValid={briefValid}
        assetValid={assetValid}
        budgetValid={budgetValid}
        reviewValid={reviewValid}
        stepValidationTried={stepValidationTried}
      />

      {/* Standardized Layout grid splitting forms and preview panels */}
      <CampaignWizardLayout sidebar={renderSidebar()}>
        <div className="space-y-6">
          {renderStepContent()}
          
          <CampaignWizardFooter
            currentStep={currentStep}
            stepsCount={stepsCount}
            onBack={handleBack}
            onNext={handleNext}
            isSubmitting={isSubmitting}
          />
        </div>
      </CampaignWizardLayout>

      {/* Mount Modals */}
      {isDraftOpen && (
        <SaveDraftModal
          isOpen={isDraftOpen}
          onClose={() => setIsDraftOpen(false)}
          onConfirm={handleConfirmDraft}
        />
      )}

      {isPaymentOpen && (
        <PaymentSimulationModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onConfirm={handleConfirmPayment}
          totalBudgetEscrow={totalBudgetEscrow}
        />
      )}

      {isCreatedOpen && (
        <CampaignCreatedModal
          isOpen={isCreatedOpen}
          onConfirm={handleSuccessRedirect}
          onReset={handleResetWizard}
        />
      )}
    </div>
  );
}

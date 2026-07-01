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

  // Modals state
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCreatedOpen, setIsCreatedOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unified wizard state object
  const wizardState: CampaignWizardState = {
    title,
    category,
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

  const handleConfirmDraft = () => {
    setIsDraftOpen(false);
    router.push("/dashboard/umkm/campaign");
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
      <div className="space-y-6">
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
    <div className="pb-32 relative">
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

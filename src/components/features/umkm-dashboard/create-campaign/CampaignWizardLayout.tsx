import { ReactNode } from "react";

interface CampaignWizardLayoutProps {
  children: ReactNode; // Active form step
  sidebar: ReactNode;  // Sidebar card elements
}

export function CampaignWizardLayout({ children, sidebar }: CampaignWizardLayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Active Form Area */}
      <div className="lg:col-span-8 space-y-6">
        {children}
      </div>

      {/* Sidebar Info Panels */}
      <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
        {sidebar}
      </div>

    </div>
  );
}

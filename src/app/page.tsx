import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { HeroSection } from "@/components/features/landing/HeroSection";
import { HowItWorksSection } from "@/components/features/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/features/landing/FeaturesSection";
import { CuanEstimatorSection } from "@/components/features/landing/CuanEstimatorSection";
import { TransparencySection } from "@/components/features/landing/TransparencySection";
import { FAQSection } from "@/components/features/landing/FAQSection";

export default function LandingPage() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CuanEstimatorSection />
      <TransparencySection />
      <FAQSection />
      <Footer />
    </main>
  );
}

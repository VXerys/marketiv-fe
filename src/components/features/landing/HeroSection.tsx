import Image from "next/image";
import { Button } from "@/components/ui/Button";
import landingPageBg from "@/assets/images/landing-page.png";
import { LANDING_CONTENT } from "@/data/content";

export function HeroSection() {
  const { hero } = LANDING_CONTENT;
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src={landingPageBg}
        alt="UMKM dan Konten Kreator berkolaborasi"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
        quality={90}
      />

      {/* Gradient Overlay (Figma: Linear, 41% #F8F40B/20%, 50% #FF8C00/20%) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,140,0,0.20) 41%, rgba(248,244,11,0.20) 50%)",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-brand-overlay" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto pt-24">
        {/* Headline */}
        <h1 className="text-hero text-white drop-shadow-lg">
          {hero.title}
        </h1>

        {/* Subtitle */}
        <p className="text-hero-subtitle text-white/85 mt-4 max-w-xl">
          {hero.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Button variant="primary" size="lg" href="/umkm">
            {hero.ctaUmkm}
          </Button>
          <Button variant="outline" size="lg" href="/creator">
            {hero.ctaCreator}
          </Button>
        </div>

        {/* Trust Line */}
        <p className="text-caption text-white/60 mt-10">
          {hero.trustLine}
        </p>
      </div>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/6281234567890"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi via WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-brand-whatsapp shadow-lg hover:scale-110 transition-transform duration-200"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-7 h-7"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.004 2.667A13.28 13.28 0 0 0 2.71 15.957a13.19 13.19 0 0 0 1.78 6.615L2.667 29.333l6.94-1.82a13.26 13.26 0 0 0 6.35 1.62h.005A13.29 13.29 0 0 0 16.004 2.667Zm0 24.337a11.02 11.02 0 0 1-5.619-1.54l-.403-.24-4.178 1.096 1.115-4.074-.263-.418a11 11 0 0 1-1.69-5.872A11.04 11.04 0 0 1 16.005 4.91 11.04 11.04 0 0 1 27.044 15.95 11.05 11.05 0 0 1 16.005 27.004Zm6.048-8.267c-.332-.166-1.965-.97-2.27-1.08-.305-.112-.527-.167-.748.166-.222.332-.86 1.08-1.054 1.302-.194.221-.388.249-.72.083-.332-.167-1.402-.517-2.672-1.648-.987-.88-1.654-1.968-1.848-2.3-.194-.333-.02-.513.146-.679.149-.149.332-.388.498-.582.166-.194.221-.332.332-.554.111-.222.056-.416-.028-.582-.083-.167-.748-1.803-1.025-2.468-.27-.648-.545-.561-.749-.571-.194-.01-.416-.012-.638-.012a1.22 1.22 0 0 0-.887.416c-.304.333-1.163 1.136-1.163 2.77 0 1.635 1.19 3.215 1.357 3.437.166.222 2.343 3.577 5.677 5.016.793.343 1.412.548 1.895.701.796.253 1.521.217 2.094.132.639-.095 1.965-.804 2.242-1.58.278-.775.278-1.44.194-1.579-.083-.139-.305-.222-.637-.388Z"
            fill="#fff"
          />
        </svg>
      </a>
    </section>
  );
}

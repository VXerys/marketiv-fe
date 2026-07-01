import Image from "next/image";
import { Button } from "@/components/ui/button";
import landingPageBg from "@/assets/images/landing-page.png";
import { LANDING_CONTENT } from "@/data/content";

export function HeroSection() {
  const { hero } = LANDING_CONTENT;
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background Image */}
      <Image src={landingPageBg} alt="UMKM dan Konten Kreator berkolaborasi" fill priority className="object-cover object-center" sizes="100vw" quality={100} />

      {/* Gradient Overlay Matching Figma */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(238deg, rgba(248,244,11,0.20) 41%, rgba(255,140,0,0.20) 50%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-4xl mx-auto pt-16 sm:pt-20">
        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-bold text-white drop-shadow-xl max-w-2xl md:max-w-3xl lg:max-w-4xl whitespace-pre-line leading-tight">{hero.title}</h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-white/95 mt-4 sm:mt-5 md:mt-6 max-w-xl md:max-w-2xl drop-shadow-lg">{hero.subtitle}</p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mt-12 sm:mt-16 md:mt-20 lg:mt-24">
          <Button variant="primary" size="xl" href="/dashboard/umkm">
            {hero.ctaUmkm}
          </Button>
          <Button variant="outline" size="xl" href="/dashboard/kreator">
            {hero.ctaCreator}
          </Button>
        </div>

        {/* Trust Line */}
        <p className="text-sm sm:text-base md:text-lg font-semibold text-white/70 mt-6 sm:mt-8 md:mt-10 lg:mt-12">{hero.trustLine}</p>
      </div>
    </section>
  );
}

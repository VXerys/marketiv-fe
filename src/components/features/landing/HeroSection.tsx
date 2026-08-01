import Image from "next/image";
import { Button } from "@/components/ui/button";
import landingPageBg from "@/assets/images/landing-page.png";
import heroMobileBg from "@/assets/images/hero-mobile.png";
import { LANDING_CONTENT } from "@/data/content";
import { routes } from "@/lib/constants/routes";

export function HeroSection() {
  const { hero } = LANDING_CONTENT;
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background Image (Desktop/Tablet) */}
      <Image src={landingPageBg} alt="UMKM dan Konten Kreator berkolaborasi" fill priority className="hidden md:block object-cover object-center" sizes="100vw" quality={100} />
      
      {/* Background Image (Mobile) */}
      <Image src={heroMobileBg} alt="UMKM dan Konten Kreator berkolaborasi" fill priority className="block md:hidden object-cover object-center" sizes="100vw" quality={100} />

      {/* Gradient Overlay Matching Figma */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(238deg, rgba(248,244,11,0.20) 41%, rgba(255,140,0,0.20) 50%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-4xl mx-auto pt-16 sm:pt-20">
        {/* Headline / Slogan */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-2xl max-w-3xl lg:max-w-5xl tracking-tight leading-[1.15]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
            {hero.titleAccent}
          </span>{" "}
          {hero.titleMain}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-neutral-100 mt-6 sm:mt-8 max-w-2xl md:max-w-3xl drop-shadow-lg leading-relaxed">
          {hero.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mt-12 sm:mt-16 md:mt-20 lg:mt-24">
          <Button variant="primary" size="xl" href={routes.registerWithRole("umkm")} className="shadow-lg shadow-primary-500/30 font-bold">
            {hero.ctaUmkm}
          </Button>
          <Button variant="outline" size="xl" href={routes.registerWithRole("creator")} className="bg-navy-800 text-white font-bold border-none shadow-lg shadow-navy-900/30 hover:bg-navy-900 hover:text-white">
            {hero.ctaCreator}
          </Button>
        </div>

        {/* Trust Line */}
        <p className="text-sm sm:text-base md:text-lg font-semibold text-white/70 mt-6 sm:mt-8 md:mt-10 lg:mt-12">{hero.trustLine}</p>
      </div>
    </section>
  );
}

import Image from "next/image";
import landingPageBg from "@/assets/images/landing-page.png";

interface DashboardHeroProps {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
}

export function DashboardHero({
  title,
  subtitle,
  searchPlaceholder,
}: DashboardHeroProps) {
  return (
    <section className="relative w-full h-[480px] md:h-[550px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src={landingPageBg}
        alt="Background banner"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
        quality={85}
      />

      {/* Gradient Overlay (Figma: Linear, 41% #FF8C00/20%, 50% #F8F40B/20%) */}
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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 flex flex-col items-start text-left">
        <h1 className="text-white font-bold text-3xl md:text-5xl lg:text-6xl drop-shadow-md leading-tight max-w-4xl">
          {title}
        </h1>
        <p className="text-hero-subtitle text-white/90 mt-4 max-w-2xl text-lg md:text-xl">
          {subtitle}
        </p>
 
        {/* Search Bar */}
        <div className="mt-8 w-full max-w-5xl flex items-center bg-white rounded-2xl md:rounded-full overflow-hidden shadow-2xl">
          <div className="pl-6 text-text-muted">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="flex-1 px-4 py-4 md:py-5 text-lg text-text-main outline-none bg-transparent placeholder:text-text-muted"
          />
          <button className="bg-brand-coral hover:bg-brand-coral/90 text-white px-8 py-4 md:py-5 transition-colors cursor-pointer flex items-center justify-center">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

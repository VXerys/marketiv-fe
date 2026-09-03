import { TERMS_CHAPTERS } from "@/content/terms";
import { Footer } from "@/components/layouts/Footer";
import { Navbar } from "@/components/layouts/Navbar";

export default function SyaratKetentuanPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-neutral-50">
      <Navbar />
      <article className="mx-auto w-full max-w-4xl flex-1 px-6 py-16 sm:py-20">
        <header className="mb-12 border-b border-neutral-200 pb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-orange-600">
            Versi 3.1 (Agustus 2026)
          </p>
          <h1 className="text-heading-2 font-bold text-neutral-900">Syarat &amp; Ketentuan</h1>
          <p className="mt-3 max-w-2xl text-body-base text-neutral-600">
            Syarat dan ketentuan penggunaan layanan Marketiv.
          </p>
        </header>

        <div className="space-y-12">
          {TERMS_CHAPTERS.map((chapter) => (
            <section key={chapter.id} aria-labelledby={chapter.id} className="scroll-mt-24">
              <header className="border-b-2 border-orange-200 pb-3">
                <p className="text-sm font-bold tracking-wide text-orange-600">{chapter.bab}</p>
                <h2 id={chapter.id} className="mt-1 text-2xl font-bold text-neutral-900">
                  {chapter.title}
                </h2>
              </header>

              <div className="mt-6 space-y-8">
                {chapter.pasalList.map((pasal) => (
                  <section key={pasal.pasalNumber} aria-labelledby={`${chapter.id}-${pasal.pasalNumber}`}>
                    <h3
                      id={`${chapter.id}-${pasal.pasalNumber}`}
                      className="text-lg font-bold text-neutral-900"
                    >
                      {pasal.pasalNumber}: {pasal.title}
                    </h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-body-base leading-relaxed text-neutral-700">
                      {pasal.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
      <Footer />
    </main>
  );
}

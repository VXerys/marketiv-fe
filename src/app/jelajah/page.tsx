import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";

export default function JelajahPage() {
  return (
    <main className="relative min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-6">
        <h1 className="text-heading-2 font-bold text-neutral-800 mb-4">Jelajah Kreator</h1>
        <p className="text-body-base text-neutral-500 max-w-md text-center">
          Halaman ini sedang dalam tahap pengembangan.
        </p>
      </div>
      <Footer />
    </main>
  );
}

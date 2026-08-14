import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3 text-stone-400">
      <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
      <p className="text-xs font-bold text-stone-600">Memuat Modul Admin Marketiv...</p>
    </div>
  );
}

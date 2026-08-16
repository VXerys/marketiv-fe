export const TIVVY_LOADING_MESSAGES = [
  "Tivvy lagi memahami pertanyaanmu…",
  "Tivvy lagi menyiapkan jawaban terbaik…",
  "Sedikit lagi, jawaban hampir siap ✨",
] as const;

type TivvyAudience = "landing" | "umkm" | "creator";

const TIVVY_WELCOME_MESSAGES: Record<TivvyAudience, string> = {
  landing:
    "Hai! 👋 Aku Tivvy, asisten AI Marketiv. Aku bisa membantumu memahami cara kerja Marketiv, memilih alur yang sesuai, serta menjawab pertanyaan untuk UMKM maupun Kreator. Pilih pertanyaan di bawah atau ceritakan apa yang ingin kamu ketahui.",
  umkm:
    "Hai! 👋 Aku Tivvy, asisten AI Marketiv untuk mendampingi perjalanan promosi bisnismu. Aku bisa membantu menjelaskan fitur di halaman ini, menyusun campaign, memilih Kreator, sampai memahami pembayaran dan performa promosi. Pilih pertanyaan di bawah atau tulis kebutuhanmu sendiri.",
  creator:
    "Hai! 👋 Aku Tivvy, asisten AI Marketiv untuk membantu aktivitasmu sebagai Kreator. Aku bisa menjelaskan fitur di halaman ini, membantu mencari dan menjalankan pekerjaan, mengatur rate card, sampai memahami penghasilan. Pilih pertanyaan di bawah atau tulis kebutuhanmu sendiri.",
};

export function getTivvyWelcomeMessage(audience: TivvyAudience): string {
  return TIVVY_WELCOME_MESSAGES[audience];
}

export function shouldShowChatbotSuggestions(
  isLoading: boolean,
  suggestionCount: number,
): boolean {
  return !isLoading && suggestionCount > 0;
}

export function getTivvyLoadingMessage(stage: number): string {
  const safeStage = Number.isFinite(stage) ? Math.max(0, Math.floor(stage)) : 0;
  return TIVVY_LOADING_MESSAGES[
    Math.min(safeStage, TIVVY_LOADING_MESSAGES.length - 1)
  ];
}

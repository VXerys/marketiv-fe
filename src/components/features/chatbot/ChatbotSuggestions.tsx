interface ChatbotSuggestionsProps {
  questions: string[];
  disabled: boolean;
  onSelect: (question: string) => void;
}

export function ChatbotSuggestions({
  questions,
  disabled,
  onSelect,
}: ChatbotSuggestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="space-y-2" aria-label="Pertanyaan yang disarankan">
      <p className="text-[11px] font-semibold text-text-muted">
        Pilih pertanyaan untuk lanjut cepat:
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(question)}
            className="max-w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-left text-xs font-medium leading-relaxed text-orange-700 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-100 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

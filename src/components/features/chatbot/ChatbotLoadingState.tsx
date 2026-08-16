interface ChatbotLoadingStateProps {
  message: string;
}

export function ChatbotLoadingState({ message }: ChatbotLoadingStateProps) {
  return (
    <div className="flex gap-2.5" aria-live="polite" aria-atomic="true">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-coral mt-0.5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M12 2C8.686 2 6 4.686 6 8v1H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v1c0 3.314 2.686 6 6 6s6-2.686 6-6v-1h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2V8c0-3.314-2.686-6-6-6z" />
          <path d="M9 13v-2M15 13v-2M10 17h4" />
        </svg>
      </div>
      <div className="rounded-2xl rounded-tl-md border border-orange-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-text-main">{message}</span>
          <span className="flex items-center gap-1" aria-hidden="true">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-coral/70 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-coral/70 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-coral/70 [animation-delay:300ms]" />
          </span>
        </div>
      </div>
    </div>
  );
}

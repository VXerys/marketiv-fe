import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ChatbotSuggestions } from "@/components/features/chatbot/ChatbotSuggestions";
import { ChatbotLoadingState } from "@/components/features/chatbot/ChatbotLoadingState";
import {
  getTivvyWelcomeMessage,
  getTivvyLoadingMessage,
  shouldShowChatbotSuggestions,
  TIVVY_LOADING_MESSAGES,
} from "@/services/chatbot/chatbot-ui";

describe("Tivvy guided chat UI", () => {
  it("renders clickable question chips and supports disabled loading state", () => {
    const html = renderToStaticMarkup(
      createElement(ChatbotSuggestions, {
        questions: ["Apa fungsi halaman ini?", "Bagaimana cara memulainya?"],
        disabled: true,
        onSelect: () => undefined,
      }),
    );

    expect(html).toContain("Apa fungsi halaman ini?");
    expect(html).toContain("Bagaimana cara memulainya?");
    expect(html.match(/<button/g)).toHaveLength(2);
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });

  it("provides three bounded loading messages", () => {
    expect(TIVVY_LOADING_MESSAGES).toEqual([
      "Tivvy lagi memahami pertanyaanmu…",
      "Tivvy lagi menyiapkan jawaban terbaik…",
      "Sedikit lagi, jawaban hampir siap ✨",
    ]);
    expect(getTivvyLoadingMessage(0)).toBe(TIVVY_LOADING_MESSAGES[0]);
    expect(getTivvyLoadingMessage(99)).toBe(TIVVY_LOADING_MESSAGES[2]);
  });

  it("renders loading status as a polite live region", () => {
    const html = renderToStaticMarkup(
      createElement(ChatbotLoadingState, {
        message: TIVVY_LOADING_MESSAGES[1],
      }),
    );

    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("Tivvy lagi menyiapkan jawaban terbaik…");
  });

  it("hides question suggestions while Tivvy is loading", () => {
    expect(shouldShowChatbotSuggestions(true, 4)).toBe(false);
    expect(shouldShowChatbotSuggestions(false, 4)).toBe(true);
    expect(shouldShowChatbotSuggestions(false, 0)).toBe(false);
  });

  it("uses helpful audience-aware welcome messages without public template wording", () => {
    const landing = getTivvyWelcomeMessage("landing");
    const umkm = getTivvyWelcomeMessage("umkm");
    const creator = getTivvyWelcomeMessage("creator");

    expect(landing).toContain("asisten AI Marketiv");
    expect(landing).toContain("UMKM maupun Kreator");
    expect(umkm).toContain("campaign");
    expect(creator).toContain("pekerjaan");
    expect([landing, umkm, creator].join(" ").toLocaleLowerCase("id-ID")).not.toContain("publik");
  });
});

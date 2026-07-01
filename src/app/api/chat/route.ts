import { NextRequest, NextResponse } from "next/server";
import { CHATBOT_KNOWLEDGE } from "@/data/chatbotKnowledge";
import type { ChatMessage, ChatRequest } from "@/types/chat";

function buildSystemPrompt(currentPath: string): string {
  const { identity, about, problems, campaignMode, rateCardMode, faq, routeContext } = CHATBOT_KNOWLEDGE;

  // Determine route-specific context
  let pageContext = routeContext.landing;
  if (currentPath.startsWith("/dashboard/umkm")) {
    pageContext = routeContext.umkm;
  } else if (currentPath.startsWith("/dashboard/kreator")) {
    pageContext = routeContext.creator;
  }

  // Build complete system prompt
  return `Kamu adalah ${identity.name}, ${identity.role}.

PERSONALITY: ${identity.personality}

TENTANG MARKETIV:
${about}

MASALAH YANG DISELESAIKAN MARKETIV:
${problems.map((p, i) => `${i + 1}. Masalah: ${p.problem}\n   Solusi: ${p.solution}`).join("\n")}

CAMPAIGN MODE (${campaignMode.tagline}):
${campaignMode.description}
Flow: ${campaignMode.flow.map((step, i) => `${i + 1}. ${step}`).join(" → ")}
Aturan Campaign Mode:
${campaignMode.rules.map((r) => `- ${r}`).join("\n")}
Keuntungan untuk UMKM: ${campaignMode.benefits.umkm.join(", ")}
Keuntungan untuk Kreator: ${campaignMode.benefits.creator.join(", ")}

RATE CARD MODE (${rateCardMode.tagline}):
${rateCardMode.description}
Flow: ${rateCardMode.flow.map((step, i) => `${i + 1}. ${step}`).join(" → ")}
Aturan Rate Card Mode:
${rateCardMode.rules.map((r) => `- ${r}`).join("\n")}
Keuntungan untuk UMKM: ${rateCardMode.benefits.umkm.join(", ")}
Keuntungan untuk Kreator: ${rateCardMode.benefits.creator.join(", ")}

FAQ (gunakan sebagai referensi untuk menjawab):
${faq.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n")}

KONTEKS HALAMAN SAAT INI:
${pageContext}

INSTRUKSI PENTING:
- Selalu jawab berdasarkan pengetahuan di atas tentang Marketiv.
- Jika ditanya hal di luar konteks Marketiv, jawab dengan sopan bahwa kamu adalah asisten khusus Marketiv dan arahkan kembali ke topik yang relevan.
- Gunakan bahasa yang mudah dipahami, terutama untuk pengguna UMKM yang mungkin tidak familiar dengan istilah teknis.
- Jawab dengan ringkas tapi informatif. Jangan terlalu panjang kecuali diminta penjelasan detail.
- Jika user tampak bingung, proaktif tawarkan langkah selanjutnya atau sarankan fitur yang relevan.
- DILARANG KERAS menampilkan proses berpikir, reasoning, thinking process, atau analisis internal apapun di jawabanmu.
- Langsung berikan jawaban final secara natural seperti percakapan biasa.
- DILARANG menggunakan format markdown apapun di jawabanmu. Tidak boleh pakai **, *, #, ##, backtick, atau formatting markdown lainnya. Tulis jawaban dalam teks biasa saja tanpa formatting khusus.
- Gunakan emoji untuk memberi penekanan, bukan markdown. Contoh: gunakan emoji 🔥 bukan **bold**. Gunakan tanda - untuk list, bukan *.
- Jawab seperti sedang chat santai di WhatsApp. Pendek, jelas, natural.`;
}

function cleanResponse(content: string): string {
  // Step 1: Remove <think>...</think> blocks
  let cleaned = content.replace(/<think[\s\S]*?<\/think>/gi, "");
  cleaned = cleaned.replace(/<\/?think>/gi, "");

  // Step 2: Remove thinking/reasoning sections before the actual answer
  // Match everything from start up to a double newline followed by a non-analysis line
  const thinkingPrefixPattern = /^[\s\S]*?(?:Thinking Process|Reasoning|Analysis|Internal Thought)[\s\S]*?\n\n/i;
  if (thinkingPrefixPattern.test(cleaned)) {
    cleaned = cleaned.replace(thinkingPrefixPattern, "");
  }

  // Step 3: Strip markdown formatting from response
  // Bold: **text** or __text__ → text
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, "$1");
  cleaned = cleaned.replace(/__(.+?)__/g, "$1");
  // Italic: *text* or _text_ → text
  cleaned = cleaned.replace(/(?<!\w)\*(.+?)\*(?!\w)/g, "$1");
  cleaned = cleaned.replace(/(?<!\w)_(.+?)_(?!\w)/g, "$1");
  // Headers: ### text → text
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");
  // Backtick code: `text` → text
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");
  // Code blocks: ```...``` → content
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");

  // Step 4: Clean up excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  cleaned = cleaned.trim();

  // Safety fallback: if stripping removed everything, return original
  if (!cleaned) {
    return content.trim();
  }

  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, currentPath } = body;

    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl = "https://openrouter.ai/api/v1";
    const model = process.env.OPENROUTER_MODEL || "qwen/qwen3-30b-a3b:free";

    if (!apiKey) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured" }, { status: 500 });
    }

    // Build system prompt with knowledge base + route context
    const systemPrompt = buildSystemPrompt(currentPath || "/");

    // Prepare messages for OpenRouter API (OpenAI-compatible format)
    const apiMessages: ChatMessage[] = [{ role: "system", content: systemPrompt }, ...messages];

    // Call OpenRouter API — disable thinking/reasoning at API level
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://marketiv.id",
        "X-Title": "Marketiv Chatbot",
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1024,
        reasoning: { effort: "none" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json({ error: "Failed to get response from AI" }, { status: response.status });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "Maaf, saya tidak bisa memproses permintaan ini.";

    // Strip any remaining thinking/reasoning content as safety net
    const assistantMessage = cleanResponse(rawContent);

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

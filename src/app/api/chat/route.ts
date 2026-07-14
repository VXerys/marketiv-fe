import { NextRequest, NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";
import { CHATBOT_KNOWLEDGE } from "@/data/chatbotKnowledge";
import type { ChatMessage, ChatRequest } from "@/types/chat";

function buildSystemPrompt(currentPath: string): string {
  const { identity, about, problems, campaignMode, rateCardMode, faq, routeContext } = CHATBOT_KNOWLEDGE;

  // Determine route-specific context
  let pageContext = routeContext.landing;
  if (currentPath.startsWith("/umkm")) {
    pageContext = routeContext.umkm;
  } else if (currentPath.startsWith("/creator")) {
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

// --- PRIMARY PROVIDER: Google Vertex AI ---
async function callVertexAI(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const projectId = process.env.VERTEX_AI_PROJECT_ID;
  const clientEmail = process.env.VERTEX_AI_CLIENT_EMAIL;
  const privateKeyRaw = process.env.VERTEX_AI_PRIVATE_KEY;
  const location = process.env.VERTEX_AI_LOCATION || "us-central1";
  const model = process.env.VERTEX_AI_MODEL || "gemini-1.5-flash";

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error("Vertex AI credentials are not fully configured in environment variables.");
  }

  // Handle escaped newlines that can occur when reading from .env files
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  const vertexAI = new VertexAI({
    project: projectId,
    location,
    googleAuthOptions: {
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    },
  });

  const generativeModel = vertexAI.getGenerativeModel({
    model,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
    systemInstruction: {
      role: "system",
      parts: [{ text: systemPrompt }],
    },
  });

  // Build chat history (all messages except the last user message)
  const history = messages.slice(0, -1).map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // The last message is the current user input
  const lastMessage = messages[messages.length - 1];

  const chat = generativeModel.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Vertex AI returned an empty response.");
  }

  return text;
}

// --- BACKUP PROVIDER: OpenRouter ---
async function callOpenRouter(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = "https://openrouter.ai/api/v1";
  const model = process.env.OPENROUTER_MODEL || "qwen/qwen3-30b-a3b:free";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const apiMessages: ChatMessage[] = [{ role: "system", content: systemPrompt }, ...messages];

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
    throw new Error(`OpenRouter API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("OpenRouter returned an empty response.");
  }

  return text;
}

// --- MAIN HANDLER ---
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, currentPath } = body;

    // Build system prompt with knowledge base + route context
    const systemPrompt = buildSystemPrompt(currentPath || "/");

    let rawContent: string;

    // Step 1: Try Primary Provider (Vertex AI)
    try {
      rawContent = await callVertexAI(systemPrompt, messages);
      console.log("[Chat API] Responding via Vertex AI (Primary)");
    } catch (vertexError) {
      // Step 2: Vertex AI failed — fallback to OpenRouter
      console.warn("[Chat API] Vertex AI failed, falling back to OpenRouter:", vertexError);
      rawContent = await callOpenRouter(systemPrompt, messages);
      console.log("[Chat API] Responding via OpenRouter (Fallback)");
    }

    // Strip any remaining thinking/reasoning content as safety net
    const assistantMessage = cleanResponse(rawContent);

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("[Chat API] All providers failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

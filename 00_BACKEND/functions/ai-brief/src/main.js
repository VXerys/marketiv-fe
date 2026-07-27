import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client, Databases } from "node-appwrite";

/**
 * Batas kolom `campaign_briefs` di appwrite.config.json. Model tidak terikat
 * apa pun, jadi keluarannya HARUS dipangkas di sini sebelum ditulis.
 *
 * Sebelumnya kelima field ditulis apa adanya: begitu Gemini melewati batas,
 * createDocument gagal 400 dan errornya cuma masuk log — brief hilang tanpa ada
 * yang tahu. Itu akar masalah di balik permintaan menaikkan `doAndDont` ke 4000,
 * yang ternyata mustahil: `campaign_briefs` sudah ~63.8KB dari plafon baris
 * MariaDB (~65.5KB) karena `briefDetail` 10000 char = 40KB.
 */
const COLUMN_LIMITS = {
  objective: 2000,
  contentAngle: 2000,
  cta: 1000,
  briefDetail: 10000,
  doAndDont: 400
};

/** Pangkas string biasa; nilai non-string diperlakukan sebagai kosong. */
function clamp(value, max) {
  if (typeof value !== "string") return "";
  return value.length <= max ? value : value.slice(0, max);
}

/**
 * `doAndDont` disimpan sebagai JSON, jadi tidak boleh dipotong sebagai string —
 * hasilnya JSON rusak yang gagal di-parse pembacanya. Sebagai gantinya butir
 * dibuang dari ekor sampai hasil stringify-nya muat.
 *
 * Mirror packDoAndDontJson() di src/lib/validations/campaign.schema.ts:107 —
 * jalur tulis wizard sudah memangkas begini sejak Sprint 3; Function inilah satu-
 * satunya penulis yang belum. Urutan buangnya sengaja sama supaya brief dari AI
 * dan brief dari wizard tidak berperilaku berbeda.
 */
function clampDoAndDont(raw, max) {
  const packed = {
    do: Array.isArray(raw?.do) ? raw.do.filter((s) => typeof s === "string") : [],
    dont: Array.isArray(raw?.dont) ? raw.dont.filter((s) => typeof s === "string") : []
  };

  let json = JSON.stringify(packed);
  while (json.length > max && (packed.do.length > 0 || packed.dont.length > 0)) {
    if (packed.dont.length >= packed.do.length) packed.dont.pop();
    else packed.do.pop();
    json = JSON.stringify(packed);
  }

  // Jaring pengaman: satu butir tunggal pun bisa melebihi batas, dan loop di atas
  // berhenti saat kedua daftar kosong. `{"do":[],"dont":[]}` = 19 karakter, jadi
  // selalu muat.
  return json.length <= max ? json : JSON.stringify({ do: [], dont: [] });
}

export default async ({ req, res, log, error }) => {
  const GEMINI_API_KEY = req.variables?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.json({ success: false, error: "GEMINI_API_KEY not configured" }, 500);
  }

  if (req.method !== "POST") {
    return res.json({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const {
      campaignId,
      description,
      type,
      materials = [],
      productName,
      targetMarket,
      goal
    } = req.body;

    if (!description || !type) {
      return res.json({ success: false, error: "Missing required fields: description, type" }, 400);
    }

    if (!["ugc", "clipping"].includes(type)) {
      return res.json({ success: false, error: "Invalid type. Must be 'ugc' or 'clipping'" }, 400);
    }

    const materialsText = materials.length
      ? materials.map((m, i) => `${i + 1}. ${m}`).join("\n")
      : "No specific materials provided.";

    const typeInstructions = type === "ugc"
      ? `This is a UGC (User Generated Content) campaign. Direct the creator to create an original TikTok video from scratch using the provided product assets (photos/videos). Suggest approaches: Green Screen effect, Voiceover, or Slideshow Montage.`
      : `This is a CLIPPING campaign. Direct the creator to cut/re-edit an existing long video from the provided source link. Include dynamic subtitles and a strong hook in the first 3 seconds.`;

    const prompt = `Generate a structured campaign brief for a TikTok content campaign.

Product Name: ${productName || "Not specified"}
Description: ${description}
Target Market: ${targetMarket || "General"}
Campaign Goal: ${goal || "Brand awareness"}
Campaign Type: ${type}

${typeInstructions}

Assets/Materials provided:
${materialsText}

Return a JSON object with this exact structure (no markdown, no code fences, raw JSON only):
{
  "objective": "string - campaign objective",
  "contentAngle": "string - content angle/approach",
  "cta": "string - call to action",
  "briefDetail": "string - detailed creative direction, visuals, key messages, asset usage instructions",
  "doAndDont": {
    "do": ["array of do's"],
    "dont": ["array of don'ts"]
  }
}

Hard length limits (output exceeding these is truncated before storage):
- objective: max ${COLUMN_LIMITS.objective} characters
- contentAngle: max ${COLUMN_LIMITS.contentAngle} characters
- cta: max ${COLUMN_LIMITS.cta} characters
- briefDetail: max ${COLUMN_LIMITS.briefDetail} characters
- doAndDont: the whole object serialized as JSON must stay under ${COLUMN_LIMITS.doAndDont} characters.
  Keep it to roughly 3 do's and 3 dont's, one short sentence each.`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let brief;
    try {
      const cleaned = responseText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      brief = JSON.parse(cleaned);
    } catch (parseError) {
      log("Failed to parse AI response as JSON, returning raw text as briefDetail");
      brief = {
        objective: "",
        contentAngle: "",
        cta: "",
        briefDetail: responseText,
        doAndDont: { do: [], dont: [] }
      };
    }

    // Satu kali pangkas, dipakai untuk tulisan DB DAN untuk respons — supaya
    // yang dilihat UMKM di layar persis sama dengan yang tersimpan. Sebelumnya
    // respons mengembalikan keluaran mentah Gemini sementara tulisan DB gagal
    // diam-diam, jadi keduanya bisa berbeda tanpa ada yang tahu.
    const stored = {
      objective: clamp(brief.objective, COLUMN_LIMITS.objective),
      contentAngle: clamp(brief.contentAngle, COLUMN_LIMITS.contentAngle),
      cta: clamp(brief.cta, COLUMN_LIMITS.cta),
      briefDetail: clamp(brief.briefDetail, COLUMN_LIMITS.briefDetail),
      doAndDont: clampDoAndDont(brief.doAndDont, COLUMN_LIMITS.doAndDont)
    };

    let briefSaveError = null;

    try {
      const client = new Client()
        .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY);

      const databases = new Databases(client);

      await databases.createDocument(
        req.variables?.APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID,
        "ai_requests",
        "unique()",
        {
          userId: req.variables?.APPWRITE_FUNCTION_USER_ID || req.body.userId || "",
          feature: "brief",
          prompt: prompt,
          response: JSON.stringify(brief)
        }
      );

      if (campaignId) {
        const briefCollectionId = process.env.CAMPAIGN_BRIEFS_COLLECTION_ID || "campaign_briefs";
        const dbId = req.variables?.APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID;
        try {
          const existing = await databases.listDocuments(dbId, briefCollectionId, [
            (await import("node-appwrite")).Query.equal("campaignId", campaignId),
            (await import("node-appwrite")).Query.limit(1)
          ]);
          if (existing.documents.length === 0) {
            await databases.createDocument(
              dbId, briefCollectionId, "unique()",
              { campaignId, ...stored, generatedByAi: true }
            );
            log(`Campaign brief saved for campaign ${campaignId}`);
          }
        } catch (briefErr) {
          // Jangan ditelan. Brief yang gagal tersimpan tapi tetap dibalas
          // `success: true` membuat UMKM mengira briefnya sudah tercatat.
          briefSaveError = briefErr.message;
          error("Failed to save campaign brief:", briefErr.message);
        }
      }
    } catch (logError) {
      // Kegagalan menulis jejak `ai_requests` memang tidak fatal — briefnya
      // sendiri sudah dihasilkan dan tetap dikembalikan ke pemanggil.
      error("Failed to log to ai_requests:", logError.message);
    }

    return res.json({
      success: true,
      brief: {
        objective: stored.objective,
        contentAngle: stored.contentAngle,
        cta: stored.cta,
        briefDetail: stored.briefDetail,
        // Kontrak respons memakai objek, kolomnya menyimpan JSON string.
        doAndDont: JSON.parse(stored.doAndDont)
      },
      // Hanya muncul saat penyimpanan gagal — field opsional, pemanggil lama
      // tidak terpengaruh.
      ...(briefSaveError ? { briefSaveError } : {})
    });

  } catch (err) {
    error("AI Brief generation failed:", err.message);
    return res.json({ success: false, error: "Failed to generate brief" }, 500);
  }
};

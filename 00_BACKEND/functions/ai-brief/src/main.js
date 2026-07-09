import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client, Databases } from "node-appwrite";

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
}`;

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

    try {
      const client = new Client()
        .setEndpoint(req.variables?.APPWRITE_ENDPOINT || process.env.APPWRITE_FUNCTION_ENDPOINT)
        .setProject(req.variables?.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(req.variables?.APPWRITE_FUNCTION_API_KEY);

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
              {
                campaignId,
                objective: brief.objective || "",
                contentAngle: brief.contentAngle || "",
                cta: brief.cta || "",
                briefDetail: brief.briefDetail || "",
                doAndDont: JSON.stringify(brief.doAndDont || { do: [], dont: [] }),
                generatedByAi: true
              }
            );
            log(`Campaign brief saved for campaign ${campaignId}`);
          }
        } catch (briefErr) {
          error("Failed to save campaign brief:", briefErr.message);
        }
      }
    } catch (logError) {
      error("Failed to log to ai_requests:", logError.message);
    }

    return res.json({
      success: true,
      brief: {
        objective: brief.objective || "",
        contentAngle: brief.contentAngle || "",
        cta: brief.cta || "",
        briefDetail: brief.briefDetail || "",
        doAndDont: brief.doAndDont || { do: [], dont: [] }
      }
    });

  } catch (err) {
    error("AI Brief generation failed:", err.message);
    return res.json({ success: false, error: "Failed to generate brief" }, 500);
  }
};

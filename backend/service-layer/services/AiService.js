const IndividualLaptopModel = require("../models/IndividualLaptopModel");
const LaptopModel = require("../models/LaptopModel"); // ✅ Registered to fix "Schema hasn't been registered" error
const AssignmentModel = require("../models/AssignmentModel");
const RepairHistory = require("../models/RepairHistory");
const { cacheData, getCachedData, invalidateCache } = require("../../config/redis");

const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require("openai");

// 🔥 ENV
const groqApiKey = process.env.GROQ_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!groqApiKey && !geminiApiKey && !openaiApiKey) {
  console.warn("[AiService] All AI API keys are missing. AI analysis will fail until set.");
}

const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

// 🔥 MODEL
const GROQ_MODEL = "llama3-8b-8192";
const GEMINI_MODEL = "gemini-1.5-flash";
const OPENAI_MODEL = "gpt-4o-mini";

const AI_PROMPT = `
You are a senior IT hardware diagnostic expert. Analyze the following laptop data and predict the hardware failure risk.
Calculate the risk based on age, repair history, and usage.

Return ONLY a valid JSON object matching exactly this structure:
{
  "predictionScore": <number between 0 and 100>,
  "riskLevel": "<Low | Medium | High | Critical>",
  "reason": "<A short, professional explanation>",
  "aiRecommendation": "<Professional recommendation>"
}
`;


// ================= GROQ AI FUNCTION =================
const getGroqPrediction = async (payload) => {
  if (!groq) throw new Error("GROQ_API_KEY missing.");

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: AI_PROMPT },
      { role: "user", content: `Laptop Data:\n${payload}` },
    ],
    temperature: 0.3,
  });

  const aiText = response.choices?.[0]?.message?.content;
  if (!aiText) throw new Error("Empty response from Groq");
  
  const jsonMatch = aiText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Groq did not return valid JSON");
  
  return JSON.parse(jsonMatch[0]);
};

// ================= GEMINI AI FUNCTION =================
const getGeminiPrediction = async (payload) => {
  if (!genAI) throw new Error("GEMINI_API_KEY missing.");

  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${AI_PROMPT}\n\nLaptop Data:\n${payload}` }] }],
    generationConfig: { temperature: 0.3 }
  });
  
  const aiText = result.response.text();
  if (!aiText) throw new Error("Empty response from Gemini");

  const jsonMatch = aiText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini did not return valid JSON");

  return JSON.parse(jsonMatch[0]);
};

// ================= OPENAI FUNCTION =================
const getOpenAiPrediction = async (payload) => {
  if (!openai) throw new Error("OPENAI_API_KEY missing.");

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: AI_PROMPT },
      { role: "user", content: `Laptop Data:\n${payload}` },
    ],
    temperature: 0.3,
  });

  const aiText = response.choices?.[0]?.message?.content;
  if (!aiText) throw new Error("Empty response from OpenAI");

  const jsonMatch = aiText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("OpenAI did not return valid JSON");

  return JSON.parse(jsonMatch[0]);
};

// ================= FALLBACK MANAGER =================
const getAiPredictionWithFallback = async (payload) => {
  // Tool 1: Try Gemini
  try {
    console.log("[AiService] Attempting Gemini...");
    return await getGeminiPrediction(payload);
  } catch (err) {
    console.warn("[AiService] Gemini failed:", err.message);
  }

  // Tool 2: Try Groq
  try {
    console.log("[AiService] Attempting Groq fallback...");
    return await getGroqPrediction(payload);
  } catch (err) {
    console.warn("[AiService] Groq failed:", err.message);
  }

  // Tool 3: Try OpenAI
  try {
    console.log("[AiService] Attempting OpenAI fallback...");
    return await getOpenAiPrediction(payload);
  } catch (err) {
    console.warn("[AiService] OpenAI failed:", err.message);
  }

  // Final Fallback if all 3 fail
  console.error("[AiService] All AI tools failed. Returning default response.");
  return {
    predictionScore: 60,
    riskLevel: "Medium",
    reason: "Moderate usage detected with limited repair history.",
    aiRecommendation: "Monitor system performance and plan maintenance.",
  };
};


// ================= MAIN FUNCTION =================
const analyzeLaptop = async (laptopId) => {
  try {
    const laptop = await IndividualLaptopModel.findById(laptopId)
      .populate("laptopModelId")
      .lean();

    if (!laptop) {
      throw new Error("Laptop asset not found");
    }

    const now = new Date();
    const purchaseDate = new Date(laptop.purchaseDate);

    const ageInMonths =
      (now.getFullYear() - purchaseDate.getFullYear()) * 12 +
      (now.getMonth() - purchaseDate.getMonth());

    const [totalAssignments, repairs] = await Promise.all([
      AssignmentModel.countDocuments({ laptopAssetId: laptopId }),
      RepairHistory.find({ laptopAssetId: laptopId }).lean(),
    ]);

    const repairCount = repairs.length;

    // 🔥 SKIP LOW RISK
    if (ageInMonths <= 24 && repairCount <= 1) {
      return {
        skipped: true,
        message: "Laptop below AI threshold",
        ageInMonths,
        repairCount,
      };
    }

    const payload = JSON.stringify({
      brand: laptop.laptopModelId?.brand,
      modelName: laptop.laptopModelId?.modelName,
      processor: laptop.laptopModelId?.processor,
      ram: laptop.laptopModelId?.ram,
      ageInMonths,
      totalAssignments,
      repairCount,
      repairHistory: repairs.map((r) => r.issueDescription),
      conditionNotes: laptop.conditionNotes,
    });

    // 🔥 CALL AI WITH FALLBACK
    const parsedResult = await getAiPredictionWithFallback(payload);

    const { predictionScore, riskLevel, reason, aiRecommendation } = parsedResult;

    if (predictionScore === undefined || !riskLevel) {
      throw new Error("AI returned invalid structure");
    }

    const updatedLaptop = await IndividualLaptopModel.findByIdAndUpdate(
      laptopId,
      {
        $set: {
          aiMetrics: {
            predictionScore,
            riskLevel,
            reason,
            aiRecommendation,
            lastPredictionDate: new Date(),
          },
        },
      },
      { new: true }
    );

    await invalidateCache("high_risk_laptops*");
    await invalidateCache("brand_failure_analysis*");

    return updatedLaptop;

  } catch (error) {
    console.error(`[AiService] Failed for ${laptopId}:`, error.message);
    throw error;
  }
};


// ================= OTHER FUNCTIONS (UNCHANGED) =================

const getHighRiskLaptops = async () => {
  const cacheKey = "high_risk_laptops";
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  const laptops = await IndividualLaptopModel.find({
    "aiMetrics.riskLevel": { $in: ["High", "Critical"] },
  })
    .populate("laptopModelId", "brand modelName processor ram")
    .populate("assignedTo", "name email")
    .sort({ "aiMetrics.predictionScore": -1 })
    .lean();

  await cacheData(cacheKey, laptops, 3600);
  return laptops;
};

const getBrandFailureAnalysis = async () => {
  const cacheKey = "brand_failure_analysis";
  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  const analysis = await IndividualLaptopModel.aggregate([
    {
      $lookup: {
        from: "laptopmodels",
        localField: "laptopModelId",
        foreignField: "_id",
        as: "modelData",
      },
    },
    { $unwind: "$modelData" },
    {
      $lookup: {
        from: "repairhistories",
        localField: "_id",
        foreignField: "laptopAssetId",
        as: "repairs",
      },
    },
    {
      $group: {
        _id: "$modelData.brand",
        totalLaptops: { $sum: 1 },
        totalRepairs: { $sum: { $size: "$repairs" } },
        avgRiskScore: { $avg: "$aiMetrics.predictionScore" },
      },
    },
    {
      $project: {
        brand: "$_id",
        totalLaptops: 1,
        totalRepairs: 1,
        failureRate: {
          $cond: [
            { $eq: ["$totalLaptops", 0] },
            0,
            { $multiply: [{ $divide: ["$totalRepairs", "$totalLaptops"] }, 100] },
          ],
        },
        avgRiskScore: { $ifNull: ["$avgRiskScore", 0] },
      },
    },
    { $sort: { failureRate: -1 } },
  ]);

  await cacheData(cacheKey, analysis, 3600 * 24);
  return analysis;
};

module.exports = {
  analyzeLaptop,
  getHighRiskLaptops,
  getBrandFailureAnalysis,
};
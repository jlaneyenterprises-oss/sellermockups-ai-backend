// /api/debug.js  — CommonJS, works with package.json as shown
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || "";
    const ai = new GoogleGenerativeAI(apiKey);

    // quick sanity checks
    const hasKey = Boolean(apiKey);
    const hasModels = !!ai && !!ai.getGenerativeModel; // method exists on client

    res.status(200).json({
      ok: true,
      package: "@google/generative-ai",
      envHasKey: hasKey,
      hasClient: !!ai,
      hasModels
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err && err.message || err) });
  }
};

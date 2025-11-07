// api/vertex-check.js
export default async function handler(_req, res) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "Missing GOOGLE_AI_API_KEY" });
    }

    // quick call to verify the API key works (no image generated)
    const testUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/imagegeneration?key=" + apiKey;

    const resp = await fetch(testUrl, { method: "GET" });
    const ok = resp.ok;

    res.status(200).json({
      ok,
      provider: "google-ai-studio",
      model: "imagen-3",
      verified: ok,
      note: ok
        ? "AI Studio Imagen 3 endpoint reachable"
        : "API key or endpoint check failed"
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}

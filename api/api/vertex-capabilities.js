// api/vertex-capabilities.js
export default async function handler(_req, res) {
  try {
    const hasKey = !!process.env.GOOGLE_AI_API_KEY;

    return res.status(200).json({
      ok: true,
      provider: "google-ai-studio",
      model: "imagen-3",
      capabilities: {
        textToImage: true,
        overlayExternalArt: false // compositing handled separately (e.g., Sharp)
      },
      env: {
        GOOGLE_AI_API_KEY: hasKey ? "present" : "missing"
      }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}

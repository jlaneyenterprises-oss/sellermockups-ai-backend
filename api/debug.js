// api/debug.js
// ESM, no external packages. Safe diagnostics for Vercel + AI Studio flow.

export default async function handler(req, res) {
  try {
    const key = process.env.GOOGLE_AI_API_KEY || "";
    const region =
      process.env.VERCEL_REGION ||
      process.env.FLY_REGION ||
      process.env.AWS_REGION ||
      "unknown";

    // Optional: accept ?echo=1 to show headers (no secrets)
    const echo = req.query?.echo === "1";

    res.status(200).json({
      ok: true,
      runtime: {
        node: process.version,
        region
      },
      env: {
        GOOGLE_AI_API_KEY: key ? "present" : "missing"
      },
      notes: [
        "This project uses Google AI Studio (Imagen 3) via REST and an API key.",
        "No Vertex SDK or service account is required.",
        "POST to /api/generate-one with { prompt | productType } to generate an image."
      ],
      request: echo
        ? {
            method: req.method,
            headers: sanitizeHeaders(req.headers),
            query: req.query || {}
          }
        : undefined
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}

function sanitizeHeaders(h = {}) {
  const hidden = ["authorization", "cookie", "x-vercel-signature"];
  const out = {};
  for (const k of Object.keys(h)) {
    out[k] = hidden.includes(k.toLowerCase()) ? "[hidden]" : h[k];
  }
  return out;
}

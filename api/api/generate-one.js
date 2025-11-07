// api/generate-one.js
// Works on Vercel (Node 20). Uses Google AI Studio Imagen 3 REST with API key.
// Requires env var: GOOGLE_AI_API_KEY

const IMAGEN_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generate";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST" });

  try {
    const body = await readJson(req);

    const { imageUrl, productType } = body || {};
    if (!productType) {
      return res.status(400).json({ ok: false, error: "Missing 'productType'" });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "Missing GOOGLE_AI_API_KEY" });
    }

    // NOTE: Imagen 3 (text-to-image) does not “overlay” external art by URL.
    // For now we generate a clean product scene you can later composite with your art.
    // (We’ll add a Sharp-based compositor next step.)
    const promptText = [
      `Ecommerce product mockup of a ${productType}.`,
      `Clean, well-lit studio, soft shadows, realistic materials, commercial quality.`,
      imageUrl ? `Inspiration/design reference URL (not overlaid programmatically): ${imageUrl}` : ""
    ]
      .filter(Boolean)
      .join(" ");

    const payload = {
      prompt: { text: promptText },
      imageGenerationConfig: {
        numberOfImages: 1,
        aspectRatio: "1:1"
      }
    };

    const resp = await fetch(`${IMAGEN_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    if (!resp.ok) {
      return res
        .status(500)
        .json({ ok: false, error: data?.error?.message || JSON.stringify(data) });
    }

    const b64 =
      data?.images?.[0]?.byteData ||
      data?.images?.[0]?.image?.bytesBase64Encoded ||
      null;

    if (!b64) {
      return res.status(502).json({ ok: false, error: "No image returned from Imagen 3" });
    }

    return res.status(200).json({ ok: true, dataUri: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error("❌ generate-one error:", err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}

// Read JSON body safely on Vercel's Node serverless
async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8") || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

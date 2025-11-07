// api/generate-one.js
import { GoogleAuth } from "google-auth-library";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { imageUrl, productType } = req.body || {};
    if (!imageUrl || !productType) {
      return res.status(400).json({ error: "Missing imageUrl or productType" });
    }

    const projectId = process.env.GOOGLE_PROJECT_ID;
    const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!projectId || !saJson) {
      return res.status(500).json({
        error: "Missing GOOGLE_PROJECT_ID or GOOGLE_SERVICE_ACCOUNT_JSON"
      });
    }

    // Auth: use service account JSON directly
    const credentials = JSON.parse(saJson);
    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const prompt = `Ecommerce product mockup of a ${productType}.
Clean, well-lit studio look, soft shadows, realistic materials.
Overlay the customer's uploaded design from this URL onto the product surface: ${imageUrl}.
Centered, proportional, no warping, high quality presentation image.`;

    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0:generateImages`;

    const body = {
      prompt,
      numberOfImages: 1
      // size: "1024x1024" // optional
    };

    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(500).json({ error: data.error?.message || JSON.stringify(data) });
    }

    const img = data.images?.[0];
    const b64 = img?.b64Json || img?.bytesBase64Encoded || img?.imageBytes || null;
    if (!b64) return res.status(500).json({ error: "No image returned from Imagen 3" });

    res.status(200).json({ ok: true, dataUri: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error("❌ Imagen error:", err);
    res.status(500).json({ error: String(err?.message || err) });
  }
}

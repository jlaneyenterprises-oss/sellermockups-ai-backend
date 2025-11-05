// api/generate-one.js
import { getVertexModel } from "../lib/vertex.js";

export default async function handler(req, res) {
  try {
    // Ensure POST with JSON
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Use POST" });
    }

    let body = req.body;
    // Some runtimes send string; normalize to object
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch {}
    }

    const { imageUrl, productType = "ornament" } = body || {};
    if (!imageUrl) {
      return res.status(400).json({ ok: false, error: "Missing imageUrl" });
    }

    const scenePrompt =
      productType === "ornament"
        ? "photorealistic Christmas tree with soft bokeh lighting, shallow depth of field"
        : "natural daylight product photography, soft shadows, realistic textures";

    const model = getVertexModel("imagen-3.0");

    const prompt = `
      Generate a 1:1 product mockup.
      Product type: ${productType}.
      Use the uploaded design image: ${imageUrl}.
      Scene: ${scenePrompt}.
      Clean composition, natural shadows, no added text or watermarks.
    `;

    const result = await model.generateImages({
      prompt,
      numberOfImages: 1,
      aspectRatio: "1:1",
      negativePrompt: "distorted, blurry, unrealistic, watermark, text"
    });

    const imageBase64 = result.images?.[0]?.b64Json;
    if (!imageBase64) {
      return res.status(500).json({ ok: false, error: "No image returned" });
    }

    res.status(200).json({ ok: true, imageBase64, prompt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
}

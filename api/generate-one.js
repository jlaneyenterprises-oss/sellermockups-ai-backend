// api/generate-one.js
import { VertexAI } from "@google-cloud/vertexai";
import fs from "node:fs";

export default async function handler(req, res) {
  // --- Enable CORS for testing ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { imageUrl, productType } = req.body || {};
    if (!imageUrl || !productType) {
      return res.status(400).json({ error: "Missing imageUrl or productType" });
    }

    // --- Use your Vercel env vars ---
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!projectId || !saJson) {
      return res.status(500).json({
        error: "Missing GOOGLE_PROJECT_ID or GOOGLE_SERVICE_ACCOUNT_JSON",
      });
    }

    // --- Auth setup ---
    const keyPath = "/tmp/gcp-key.json";
    fs.writeFileSync(keyPath, saJson, "utf8");
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

    // --- Create VertexAI client ---
    const vertexAI = new VertexAI({ project: projectId, location: "us-central1" });

    // ✅ Use vertexAI.preview.getGenerativeModel (correct constructor)
    const model = vertexAI.preview.getGenerativeModel({
      model: "imagen-3.0",
    });

    const prompt = `Ecommerce product mockup of a ${productType}.
Clean, well-lit studio look, soft shadows, realistic materials.
Overlay the customer's uploaded design from this URL onto the product surface: ${imageUrl}.
Centered, proportional, no warping, high quality presentation image.`;

    console.log("🎨 Calling Imagen 3...");
    const result = await model.generateImages({
      prompt,
      numberOfImages: 1,
      size: "1024x1024",
    });

    const img = result?.images?.[0];
    if (!img?.b64Json && !img?.bytesBase64Encoded) {
      return res.status(500).json({ error: "No image returned from Vertex AI" });
    }

    const b64 = img.b64Json ?? img.bytesBase64Encoded;
    return res.status(200).json({ ok: true, dataUri: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error("❌ Generation failed:", err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}

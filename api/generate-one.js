import { ImageGenerationModel } from "@google-cloud/vertexai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { imageUrl, productType } = req.body || {};
    if (!imageUrl || !productType) {
      return res.status(400).json({ error: "Missing imageUrl or productType" });
    }

    const model = new ImageGenerationModel({
      model: "imagen-3.0",
      project: process.env.GCP_PROJECT_ID,
      location: "us-central1",
    });

    const prompt = `Ecommerce product mockup of a ${productType}. 
    Clean, well-lit studio look, soft shadows, realistic materials. 
    Overlay the customer's uploaded design from this URL onto the product surface: ${imageUrl}. 
    Centered, proportional, no warping, high quality presentation image.`;

    const result = await model.generateImages({
      prompt,
      numberOfImages: 1,
      size: "1024x1024",
    });

    const img = result.images?.[0];
    if (!img?.b64Json && !img?.bytesBase64Encoded) {
      return res.status(500).json({ error: "No image returned from Vertex AI" });
    }

    const b64 = img.b64Json ?? img.bytesBase64Encoded;
    return res.status(200).json({
      ok: true,
      dataUri: `data:image/png;base64,${b64}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}

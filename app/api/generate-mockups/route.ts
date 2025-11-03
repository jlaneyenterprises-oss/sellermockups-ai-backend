import { GoogleGenerativeAI } from "@google/generative-ai";
import { put } from "@vercel/blob";
import JSZip from "jszip";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SCENES: Record<string, string[]> = {
  ornament: ["cozy Christmas tree", "snowy window", "gift table", "hand holding", "fireplace"],
  "t-shirt": ["streetwear model", "beach sunset", "coffee shop", "gym", "park"],
  mug: ["desk with laptop", "kitchen morning", "outdoor hike", "cozy couch", "office"]
};

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("design") as File;
  const product = (form.get("product") as string) || "ornament";
  const count = Math.min(Math.max(Number(form.get("count")) || 5, 1), 10);

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mime = file.type;

  const scenes = SCENES[product]?.slice(0, count) || Array(count).fill("lifestyle");

  const images = await Promise.all(
    scenes.map(async (scene) => {
      const result = await model.generateContent([
        `Photorealistic 1:1 mockup. Place uploaded design on blank ${product} in a ${scene}. High detail, professional, no text.`,
        { inlineData: { data: base64, mimeType: mime } }
      ]);
      const part = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return part ? `data:image/png;base64,${part}` : "";
    })
  );

  const zip = new JSZip();
  images.forEach((img, i) => zip.file(`mockup-${i+1}.png`, img.split(",")[1], { base64: true }));
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const zipUrl = URL.createObjectURL(zipBlob);

  return Response.json({
    mockups: images.map((url, i) => ({ id: i, url, prompt: scenes[i] })),
    zipUrl
  });
}

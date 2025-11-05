import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || 'missing' });
    const hasModels = !!ai.models;
    const hasGenerateImages = hasModels && typeof ai.models.generateImages === 'function';
    res.status(200).json({
      ok: true,
      package: '@google/genai',
      hasModels,
      hasGenerateImages,
      envHasKey: Boolean(process.env.GOOGLE_API_KEY)
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}

// api/debug.ts — Vercel Serverless Function
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || 'missing' });
    const hasModels = !!(ai as any).models;
    const hasGenerateImages =
      hasModels && typeof (ai as any).models.generateImages === 'function';

    res.status(200).json({
      ok: true,
      package: '@google/genai',
      hasModels,
      hasGenerateImages,
      envHasKey: !!process.env.GOOGLE_API_KEY
    });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message });
  }
}

// api/vertex-capabilities.js
import { getVertexModel } from "../lib/vertex.js";

export default async function handler(req, res) {
  try {
    const model = await getVertexModel("imagen-3.0"); // or "imagen-3.0-fast"
    const hasGenerateImages = typeof model.generateImages === "function";
    res.status(200).json({ ok: true, hasGenerateImages });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

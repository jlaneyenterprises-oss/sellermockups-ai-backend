// api/vertex-check.js
import { getVertexModel } from "../lib/vertex.js";

export default async function handler(req, res) {
  try {
    await getVertexModel("imagen-3.0"); // just creates a handle; no generation
    res.status(200).json({ ok: true, model: "imagen-3.0 connected" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

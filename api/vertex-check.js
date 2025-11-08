import { GoogleAuth } from "google-auth-library";

export default async function handler(req, res) {
  try {
    const project = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_LOCATION || "us-central1";
    const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    if (!project || !saJson) {
      return res.status(200).json({
        ok: false,
        provider: "google-ai-studio",
        model: "imagen-3",
        verified: false,
        note: "Missing GOOGLE_PROJECT_ID or GOOGLE_SERVICE_ACCOUNT_JSON"
      });
    }

    const credentials = JSON.parse(saJson);
    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    // Probe the published model resource (simple GET)
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/imagen-3.0`;

    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (r.ok) {
      return res.status(200).json({
        ok: true,
        provider: "google-ai-studio",
        model: "imagen-3",
        verified: true
      });
    }

    const text = await r.text();
    return res.status(200).json({
      ok: false,
      provider: "google-ai-studio",
      model: "imagen-3",
      verified: false,
      note: text
    });
  } catch (err) {
    return res.status(200).json({
      ok: false,
      provider: "google-ai-studio",
      model: "imagen-3",
      verified: false,
      note: String(err?.message || err)
    });
  }
}

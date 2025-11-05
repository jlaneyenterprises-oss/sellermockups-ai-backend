// lib/vertex.js  (ESM)
import { GoogleAuth } from "google-auth-library";
import { VertexAI } from "@google-cloud/vertexai";

let cachedVertex = null;

export async function getVertexModel(modelName = "imagen-3.0") {
  // Build Vertex client once, reuse on next calls.
  if (!cachedVertex) {
    const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");

    const auth = new GoogleAuth({
      credentials: creds,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const authClient = await auth.getClient();

    cachedVertex = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID,
      location: "us-central1",
      authClient,
    });
  }

  return cachedVertex.getGenerativeModel({ model: modelName });
}

// lib/vertex.js
import { VertexAI } from "@google-cloud/vertexai";

export function getVertexModel(modelName = "imagen-3.0") {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");

  const vertex = new VertexAI({
    project: process.env.GOOGLE_PROJECT_ID,
    location: "us-central1",
    googleAuthOptions: { credentials },
  });

  // For Imagen 3, this returns an Images-capable model with generateImages()
  return vertex.getGenerativeModel({ model: modelName });
}

// lib/vertex.js
import { GoogleAuth } from "google-auth-library";
import { VertexAI } from "@google-cloud/vertexai";

export function getVertexModel(modelName = "imagen-3.0") {
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!saJson) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON");

  const credentials = JSON.parse(saJson);

  const auth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"]
  });

  const vertex = new VertexAI({
    project: process.env.GOOGLE_PROJECT_ID,
    location: process.env.LOCATION || "us-central1",
    authClient: auth
  });

  // This returns a handle to the Imagen model; we’ll call it next.
  return vertex.getGenerativeModel({ model: modelName });
}

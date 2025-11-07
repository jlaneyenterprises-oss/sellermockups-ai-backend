// lib/vertex.js
// ESM helpers for Google AI Studio (Imagen 3) via REST.
// Requires env var: GOOGLE_AI_API_KEY

const IMAGEN_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generate";

/**
 * Generate an image with Imagen 3 using a plain text prompt.
 * Returns the full JSON from the API.
 */
export async function generateSimpleImage(
  promptText,
  { aspectRatio = "1:1", numberOfImages = 1 } = {}
) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_AI_API_KEY");

  const body = {
    prompt: { text: promptText },
    imageGenerationConfig: { numberOfImages, aspectRatio }
  };

  const resp = await fetch(`${IMAGEN_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Imagen request failed: ${resp.status} ${text}`);
  }

  return resp.json();
}

/**
 * Convenience helper:
 * Returns a ready-to-use data URI for the first image.
 */
export async function generateDataUri(promptText, opts) {
  const data = await generateSimpleImage(promptText, opts);
  const b64 =
    data?.images?.[0]?.byteData ||
    data?.images?.[0]?.image?.bytesBase64Encoded ||
    null;

  if (!b64) throw new Error("No image returned from Imagen 3");
  return `data:image/png;base64,${b64}`;
}

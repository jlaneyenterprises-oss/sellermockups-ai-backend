// api/ping.js
export default async function handler(_req, res) {
  res.status(200).json({
    ok: true,
    ts: new Date().toISOString(),
    env: {
      GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY ? "present" : "missing"
    }
  });
}

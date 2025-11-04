// api/ping.js
export default async function handler(req, res) {
  res.status(200).json({
    ok: true,
    envs: {
      GOOGLE_SERVICE_ACCOUNT_JSON: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID || null
    }
  });
}

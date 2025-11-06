export default async function handler(req, res) {
  try {
    res.status(200).json({
      ok: true,
      route: "/api/debug",
      envHasKey: Boolean(process.env.GOOGLE_API_KEY),
      node: process.version
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

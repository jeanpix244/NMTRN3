// Vercel serverless function that connects the landing-page chat widget to
// OpenAI's ChatGPT API. Configure with environment variables:
//   OPENAI_API_KEY   (required)  API key from https://platform.openai.com/api-keys
//   OPENAI_MODEL     (optional)  model id, defaults to OpenAI's basic chat model
//   OPENAI_BASE_URL  (optional)  OpenAI-compatible base URL

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT =
  "You are the Nemotron assistant embedded on the NVIDIA Nemotron developer " +
  "repository landing page. Help visitors understand the Nemotron model " +
  "family (Ultra, Super, Nano, Nano Omni), training recipes, deployment " +
  "guides, and how to use this repository. Keep answers concise and accurate.";

function sanitizeMessages(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error:
        "Chat is not configured. Set the OPENAI_API_KEY environment variable " +
        "(get one at https://platform.openai.com/api-keys) to enable the assistant.",
    });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: "Invalid JSON body." });
      return;
    }
  }

  const messages = sanitizeMessages(body && body.messages);
  if (messages.length === 0) {
    res.status(400).json({ error: "No valid messages provided." });
    return;
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const baseUrl = (process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL).replace(
    /\/$/,
    ""
  );

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 1024,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      res.status(502).json({
        error: "The model provider returned an error.",
        status: upstream.status,
        detail: detail.slice(0, 500),
      });
      return;
    }

    const data = await upstream.json();
    const reply =
      data &&
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;

    if (!reply) {
      res.status(502).json({ error: "Empty response from the model." });
      return;
    }

    res.status(200).json({ reply, model });
  } catch (err) {
    res.status(500).json({
      error: "Failed to reach the model provider.",
      detail: String(err && err.message ? err.message : err),
    });
  }
};

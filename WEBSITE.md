# Landing page & chat assistant

The static landing page lives in [`public/index.html`](public/index.html) and is
deployed on Vercel (see [`vercel.json`](vercel.json), `outputDirectory: public`).

It includes an "Ask Nemotron" chat widget in the bottom-right corner that talks to
a Vercel serverless function at [`api/chat.js`](api/chat.js). The function proxies
requests to OpenAI's ChatGPT API, keeping the API key server-side.

## Configuration

Set these environment variables in your Vercel project (Project Settings →
Environment Variables):

| Variable          | Required | Default                          | Description                                          |
| ----------------- | -------- | -------------------------------- | ---------------------------------------------------- |
| `OPENAI_API_KEY`  | yes      | —                                | API key from https://platform.openai.com/api-keys    |
| `OPENAI_MODEL`    | no       | `gpt-4o-mini`                    | ChatGPT model id (OpenAI's basic, low-cost model)    |
| `OPENAI_BASE_URL` | no       | `https://api.openai.com/v1`      | OpenAI-compatible base URL                           |

If `OPENAI_API_KEY` is not set, the widget stays functional but replies with a
clear "chat is not configured" message instead of failing silently.

## Local development

```bash
npm i -g vercel
OPENAI_API_KEY=sk-xxxx vercel dev
```

Then open http://localhost:3000 and click **Ask Nemotron**.

## Using a different provider

Any OpenAI-compatible chat-completions endpoint works — point `OPENAI_BASE_URL`
at it, set the matching `OPENAI_MODEL`, and provide the key via `OPENAI_API_KEY`.

# Landing page & chat assistant

The static landing page lives in [`public/index.html`](public/index.html) and is
deployed on Vercel (see [`vercel.json`](vercel.json), `outputDirectory: public`).

It includes an "Ask Nemotron" chat widget in the bottom-right corner that talks to
a Vercel serverless function at [`api/chat.js`](api/chat.js). The function proxies
requests to an NVIDIA Nemotron model on the OpenAI-compatible NIM API
(https://build.nvidia.com), keeping the API key server-side.

## Configuration

Set these environment variables in your Vercel project (Project Settings →
Environment Variables):

| Variable          | Required | Default                                   | Description                              |
| ----------------- | -------- | ----------------------------------------- | ---------------------------------------- |
| `NVIDIA_API_KEY`  | yes      | —                                         | API key from https://build.nvidia.com    |
| `NEMOTRON_MODEL`  | no       | `nvidia/llama-3.3-nemotron-super-49b-v1`  | Model id served by the endpoint          |
| `NVIDIA_BASE_URL` | no       | `https://integrate.api.nvidia.com/v1`     | OpenAI-compatible base URL               |

If `NVIDIA_API_KEY` is not set, the widget stays functional but replies with a
clear "chat is not configured" message instead of failing silently.

## Local development

```bash
npm i -g vercel
NVIDIA_API_KEY=nvapi-xxxx vercel dev
```

Then open http://localhost:3000 and click **Ask Nemotron**.

## Using a different provider

Any OpenAI-compatible chat-completions endpoint works — point `NVIDIA_BASE_URL`
at it, set the matching `NEMOTRON_MODEL`, and provide the key via `NVIDIA_API_KEY`.

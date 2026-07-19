// services/ollama.service.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// The only place in the codebase that speaks HTTP to Ollama directly. Chat
// streaming, vision calls, and (indirectly, via LangChain) embeddings all
// route through here, so if Ollama's API ever changes, this is the one file
// to update.
// -----------------------------------------------------------------------------
import { config } from '../config/index.js';

/**
 * Streams a chat completion from Ollama's /api/chat endpoint.
 * @param {{system: string, messages: {role: string, content: string}[], images?: string[]}} params
 * @param {(token: string) => void} onToken
 */
export async function streamChat({ system, messages, images }, onToken) {
  const { chatModel, temperature, maxTokens, visionModel } = config.settings;

  const chatMessages = [{ role: 'system', content: system }, ...messages];

  if (images?.length) {
    const lastUserMsg = chatMessages[chatMessages.length - 1];
    lastUserMsg.images = images;
  }

  const model = images?.length ? visionModel : chatModel;

  const res = await fetch(`${config.ollamaBaseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: chatMessages,
      stream: true,
      options: { temperature, num_predict: maxTokens },
    }),
  });

  if (!res.ok || !res.body) {
    // IMPORTANT: read Ollama's actual error body instead of discarding it —
    // this is what tells us WHY it failed (bad model name, out of memory,
    // malformed request, etc.) instead of a generic "500" with no context.
    let detail = '';
    try {
      const bodyText = await res.text();
      try {
        detail = JSON.parse(bodyText).error || bodyText;
      } catch {
        detail = bodyText;
      }
    } catch {
      detail = '(could not read response body)';
    }
    throw new Error(
      `Ollama request failed: ${res.status} ${res.statusText} — model "${model}" — ${detail}`
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;
      const json = JSON.parse(line);
      const token = json.message?.content || '';
      if (token) {
        fullText += token;
        onToken(token);
      }
      if (json.done) return fullText;
    }
  }

  return fullText;
}

/** Quick health check used by error-handling middleware / status endpoint. */
export async function isOllamaOnline() {
  try {
    const res = await fetch(`${config.ollamaBaseUrl}/api/tags`);
    return res.ok;
  } catch {
    return false;
  }
}
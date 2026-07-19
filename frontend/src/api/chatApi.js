// api/chatApi.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// Wraps every backend call the UI needs, including the tricky one: reading
// a Server-Sent-Events stream from POST /chat with fetch() (axios doesn't
// support streaming well in the browser). Keeping this here means
// components just call `sendChatMessage(...)` and don't know or care that
// SSE is involved.
// -----------------------------------------------------------------------------
import { api } from './axiosClient.js';

export async function uploadPdf(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload/pdf', formData);
  return data;
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload/image', formData);
  return data;
}

export async function uploadAudio(blob) {
  const formData = new FormData();
  formData.append('file', blob, 'recording.webm');
  const { data } = await api.post('/audio', formData);
  return data;
}

export async function fetchHistory() {
  const { data } = await api.get('/history');
  return data;
}

export async function fetchChat(chatId) {
  const { data } = await api.get(`/history/${chatId}`);
  return data;
}

export async function deleteChat(chatId) {
  const { data } = await api.delete(`/history/${chatId}`);
  return data;
}

export async function getSettings() {
  const { data } = await api.get('/settings');
  return data;
}

export async function updateSettings(settings) {
  const { data } = await api.put('/settings', settings);
  return data;
}

/**
 * Streams a chat response token-by-token via SSE.
 * @param {{chatId?: string, message: string, mode: 'general'|'rag'|'image', imagePath?: string}} payload
 * @param {{onMeta?: (m: any) => void, onToken: (t: string) => void, onDone?: (d: any) => void}} handlers
 */
export async function sendChatMessage(payload, { onMeta, onToken, onDone }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ error: 'Chat request failed.' }));
    throw new Error(err.error || 'Chat request failed.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line.
    const frames = buffer.split('\n\n');
    buffer = frames.pop();

    for (const frame of frames) {
      const eventMatch = frame.match(/^event: (\w+)/m);
      const dataMatch = frame.match(/^data: (.*)$/m);
      if (!eventMatch || !dataMatch) continue;

      const event = eventMatch[1];
      const data = JSON.parse(dataMatch[1]);

      if (event === 'meta') onMeta?.(data);
      if (event === 'token') onToken(data.token);
      if (event === 'done') onDone?.(data);
    }
  }
}

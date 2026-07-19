// controllers/settings.controller.js
// Backs the Settings page: model names, chunk size/overlap, top K,
// temperature, max tokens — all persisted via config.saveSettings.
import { config } from '../config/index.js';
import { resetVectorStoreCache } from '../vectorstore/chroma.client.js';

export function getSettings(req, res) {
  res.json(config.settings);
}

export function putSettings(req, res) {
  const updated = config.saveSettings(req.body);
  // Embedding model changed -> the cached Chroma/Ollama-embeddings binding
  // must be rebuilt on next use.
  if (req.body.embedModel) resetVectorStoreCache();
  res.json(updated);
}

// config/index.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// Centralizes every environment-driven and user-tunable setting in one place.
// Nothing else in the app should call `process.env` directly — this is the
// single source of truth, so swapping models or Chroma URLs never means
// hunting through services.
// -----------------------------------------------------------------------------
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_PATH = path.join(__dirname, 'settings.json');

// Runtime-editable settings (changed from the Settings page in the UI) are
// persisted to settings.json so they survive a server restart, while still
// falling back to .env defaults on first boot.
function loadSettings() {
  const defaults = {
    chatModel: process.env.CHAT_MODEL || 'llama3.2',
    embedModel: process.env.EMBED_MODEL || 'nomic-embed-text',
    visionModel: process.env.VISION_MODEL || 'llava',
    chunkSize: Number(process.env.CHUNK_SIZE || 1000),
    chunkOverlap: Number(process.env.CHUNK_OVERLAP || 150),
    topK: Number(process.env.TOP_K || 4),
    temperature: Number(process.env.TEMPERATURE || 0.2),
    maxTokens: Number(process.env.MAX_TOKENS || 1024),
  };

  if (fs.existsSync(SETTINGS_PATH)) {
    try {
      const saved = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
      return { ...defaults, ...saved };
    } catch {
      return defaults;
    }
  }
  return defaults;
}

function saveSettings(newSettings) {
  const current = loadSettings();
  const merged = { ...current, ...newSettings };
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2));
  return merged;
}

export const config = {
  port: Number(process.env.PORT || 5000),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  chromaUrl: process.env.CHROMA_URL || 'http://localhost:8000',
  chromaCollection: process.env.CHROMA_COLLECTION || 'local_ai_chat_kb',
  whisperModel: process.env.WHISPER_MODEL || 'base.en',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 25),
  get settings() {
    return loadSettings();
  },
  saveSettings,
  paths: {
    uploadsPdf: path.join(__dirname, '..', 'uploads', 'pdf'),
    uploadsImages: path.join(__dirname, '..', 'uploads', 'images'),
    uploadsAudio: path.join(__dirname, '..', 'uploads', 'audio'),
    chats: path.join(__dirname, '..', 'chats'),
  },
};

// services/image.service.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// Handles everything specific to "user attached an image": validation,
// reading the file back as base64 (the format Ollama's vision models
// require), and building the vision-specific prompt. Kept separate from
// chat.service.js so image logic can evolve (e.g. resizing large images
// before sending) without touching normal text-chat code.
// -----------------------------------------------------------------------------
import fs from 'fs/promises';
import path from 'path';

const ALLOWED_EXT = ['.png', '.jpg', '.jpeg'];

export function validateImageFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    const err = new Error(`Unsupported image type "${ext}". Allowed: png, jpg, jpeg.`);
    err.status = 400;
    throw err;
  }
}

/**
 * Reads an uploaded image off disk and returns it as a base64 string with
 * no data-URI prefix — Ollama's /api/chat expects raw base64 in the
 * `images` array on a message.
 */
export async function imageToBase64(filePath) {
  const buffer = await fs.readFile(filePath);
  return buffer.toString('base64');
}

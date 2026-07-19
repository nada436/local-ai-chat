// services/audio.service.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// Converts a recorded audio file into text using a LOCAL Whisper model
// (via nodejs-whisper, which wraps whisper.cpp — no audio ever leaves the
// machine, satisfying the "no cloud APIs" requirement). The transcribed
// text is then handed back to the caller to be treated as a normal chat
// message, so nothing downstream needs to know it originated as audio.
// -----------------------------------------------------------------------------
import { nodewhisper } from 'nodejs-whisper';
import { config } from '../config/index.js';
import path from 'path';

const ALLOWED_EXT = ['.wav', '.mp3', '.webm', '.m4a', '.ogg'];

export function validateAudioFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    const err = new Error(`Unsupported audio type "${ext}".`);
    err.status = 400;
    throw err;
  }
}

/**
 * Transcribes an audio file to text using a locally-running Whisper model.
 * nodejs-whisper handles resampling to 16kHz mono WAV internally (required
 * by whisper.cpp) and runs the model as a local binary — first call for a
 * given WHISPER_MODEL will download the model weights once and cache them.
 * @param {string} filePath - absolute path to the uploaded audio file
 * @returns {Promise<string>} transcribed text
 */
export async function transcribeAudio(filePath) {
  const result = await nodewhisper(filePath, {
    modelName: config.whisperModel,
    autoDownloadModelName: config.whisperModel,
    whisperOptions: {
      outputInText: true,
      language: 'auto',
    },
  });

  // nodejs-whisper returns either a string or an object depending on
  // version/options — normalize to a plain trimmed string either way.
  const text = typeof result === 'string' ? result : result?.text || '';
  return text.trim();
}

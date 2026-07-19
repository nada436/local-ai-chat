// controllers/upload.controller.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// HTTP-layer glue for the three upload endpoints (PDF, image, audio). Each
// handler validates the request, calls the relevant service, and returns a
// small JSON summary — all heavy lifting (parsing, chunking, embedding,
// transcribing) lives in the services, not here.
// -----------------------------------------------------------------------------
import { ingestPdf, removePdf } from '../services/rag.service.js';
import { validateImageFile } from '../services/image.service.js';
import { validateAudioFile, transcribeAudio } from '../services/audio.service.js';

export async function postUploadPdf(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file provided.' });

    // See rag.service.ingestPdf for the full extract -> chunk -> embed ->
    // store pipeline. We use the ORIGINAL filename as the stable metadata
    // key (the file on disk is renamed to a UUID to avoid collisions).
    const result = await ingestPdf(req.file.path, req.file.originalname);

    res.json({ message: 'PDF ingested and indexed.', ...result });
  } catch (err) {
    next(err);
  }
}

export async function deleteUploadPdf(req, res, next) {
  try {
    const { filename } = req.params;
    await removePdf(filename);
    res.json({ message: `Removed "${filename}" from the knowledge base.` });
  } catch (err) {
    next(err);
  }
}

export async function postUploadImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided.' });
    validateImageFile(req.file);

    // We don't analyze the image here — the actual vision call happens in
    // POST /chat (mode=image) so it can be combined with the user's
    // question and streamed like any other chat response.
    res.json({ message: 'Image uploaded.', imagePath: req.file.path, filename: req.file.filename });
  } catch (err) {
    next(err);
  }
}

export async function postUploadAudio(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file provided.' });
    validateAudioFile(req.file);

    // Local Whisper transcription — see audio.service.js. The resulting
    // text is handed back so the frontend can drop it straight into the
    // chat input (or auto-send it) as if the user had typed it.
    const text = await transcribeAudio(req.file.path);

    res.json({ message: 'Audio transcribed.', text });
  } catch (err) {
    next(err);
  }
}

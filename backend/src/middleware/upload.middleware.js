// middleware/upload.middleware.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// Configures Multer disk storage once, with separate destinations per file
// type (pdf/images/audio) and a shared size limit, so route files just
// import the ready-made middleware instead of re-configuring Multer each
// time.
// -----------------------------------------------------------------------------
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';

function makeUploader(destination) {
  const storage = multer.diskStorage({
    destination,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
  });
}

export const uploadPdf = makeUploader(config.paths.uploadsPdf);
export const uploadImage = makeUploader(config.paths.uploadsImages);
export const uploadAudio = makeUploader(config.paths.uploadsAudio);

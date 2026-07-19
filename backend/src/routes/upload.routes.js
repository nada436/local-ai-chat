import { Router } from 'express';
import { uploadPdf, uploadImage, uploadAudio } from '../middleware/upload.middleware.js';
import {
  postUploadPdf,
  deleteUploadPdf,
  postUploadImage,
  postUploadAudio,
} from '../controllers/upload.controller.js';

const router = Router();
router.post('/pdf', uploadPdf.single('file'), postUploadPdf);
router.delete('/pdf/:filename', deleteUploadPdf);
router.post('/image', uploadImage.single('file'), postUploadImage);
export default router;

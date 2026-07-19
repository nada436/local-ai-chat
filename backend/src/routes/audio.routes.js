import { Router } from 'express';
import { uploadAudio } from '../middleware/upload.middleware.js';
import { postUploadAudio } from '../controllers/upload.controller.js';

const router = Router();
router.post('/', uploadAudio.single('file'), postUploadAudio);
export default router;

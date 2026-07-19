import { Router } from 'express';
import { getSettings, putSettings } from '../controllers/settings.controller.js';

const router = Router();
router.get('/', getSettings);
router.put('/', putSettings);
export default router;

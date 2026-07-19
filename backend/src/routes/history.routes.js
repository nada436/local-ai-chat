import { Router } from 'express';
import { getHistory, getHistoryById, deleteHistoryById } from '../controllers/history.controller.js';

const router = Router();
router.get('/', getHistory);
router.get('/:chatId', getHistoryById);
router.delete('/:chatId', deleteHistoryById);
export default router;

// controllers/history.controller.js
import * as chatService from '../services/chat.service.js';

export async function getHistory(req, res, next) {
  try {
    res.json(await chatService.listChats());
  } catch (err) {
    next(err);
  }
}

export async function getHistoryById(req, res, next) {
  try {
    const chat = await chatService.getChat(req.params.chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found.' });
    res.json(chat);
  } catch (err) {
    next(err);
  }
}

export async function deleteHistoryById(req, res, next) {
  try {
    await chatService.deleteChat(req.params.chatId);
    res.json({ message: 'Chat deleted.' });
  } catch (err) {
    next(err);
  }
}

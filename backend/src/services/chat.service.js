// services/chat.service.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// Persists chat sessions as JSON files on disk (one file per chat id) —
// simple, dependency-free storage that's easy to swap for a real DB later
// since every read/write goes through this one module.
// -----------------------------------------------------------------------------
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';

function chatFilePath(chatId) {
  return path.join(config.paths.chats, `${chatId}.json`);
}

export async function createChat(firstMessage) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const chat = {
    id,
    title: firstMessage?.slice(0, 50) || 'New Chat',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  await fs.writeFile(chatFilePath(id), JSON.stringify(chat, null, 2));
  return chat;
}

export async function getChat(chatId) {
  try {
    const raw = await fs.readFile(chatFilePath(chatId), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function listChats() {
  const files = await fs.readdir(config.paths.chats);
  const chats = await Promise.all(
    files
      .filter((f) => f.endsWith('.json'))
      .map(async (f) => JSON.parse(await fs.readFile(path.join(config.paths.chats, f), 'utf-8')))
  );
  // Most recently updated first, like ChatGPT's sidebar.
  return chats
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map(({ id, title, createdAt, updatedAt }) => ({ id, title, createdAt, updatedAt }));
}

export async function appendMessages(chatId, newMessages) {
  const chat = await getChat(chatId);
  if (!chat) throw Object.assign(new Error('Chat not found'), { status: 404 });

  chat.messages.push(...newMessages);
  chat.updatedAt = new Date().toISOString();
  if (chat.title === 'New Chat' && newMessages[0]?.content) {
    chat.title = newMessages[0].content.slice(0, 50);
  }

  await fs.writeFile(chatFilePath(chatId), JSON.stringify(chat, null, 2));
  return chat;
}

export async function deleteChat(chatId) {
  await fs.unlink(chatFilePath(chatId)).catch(() => {});
}

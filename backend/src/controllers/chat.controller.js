// controllers/chat.controller.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// HTTP-layer glue for POST /chat. Decides WHICH prompt strategy to use
// (RAG vs image vs general), delegates the actual LLM call + history
// persistence to services, and streams tokens back over the response as
// they arrive from Ollama.
// -----------------------------------------------------------------------------
import { streamChat, isOllamaOnline } from '../services/ollama.service.js';
import { buildGeneralPrompt, buildImagePrompt } from '../prompts/promptBuilder.js';
import { buildRagContext } from '../services/rag.service.js';
import { imageToBase64 } from '../services/image.service.js';
import * as chatService from '../services/chat.service.js';

export async function postChat(req, res, next) {
  try {
    const { chatId, message, mode, imagePath } = req.body;

    if (!message?.trim() && !imagePath) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    if (!(await isOllamaOnline())) {
      return res.status(503).json({ error: 'Ollama is offline. Start it with `ollama serve`.' });
    }

    let chat = chatId ? await chatService.getChat(chatId) : null;
    if (!chat) chat = await chatService.createChat(message);

    let systemPrompt;
    let images;
    let sources = [];

    if (mode === 'rag') {
      const ragContext = await buildRagContext(message);
      systemPrompt = ragContext.systemPrompt;
      sources = ragContext.sources;
    } else if (mode === 'image' && imagePath) {
      systemPrompt = buildImagePrompt(message);
      images = [await imageToBase64(imagePath)];
    } else {
      systemPrompt = buildGeneralPrompt();
    }

    const priorMessages = chat.messages.map(({ role, content }) => ({ role, content }));
    const userMessage = { role: 'user', content: message };

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`event: meta\ndata: ${JSON.stringify({ chatId: chat.id, sources })}\n\n`);

    // Once flushHeaders() has run we can no longer res.json() an error —
    // from here on, failures must go out as an SSE "error" event.
    let fullAnswer;
    try {
      fullAnswer = await streamChat(
        { system: systemPrompt, messages: [...priorMessages, userMessage], images },
        (token) => {
          res.write(`event: token\ndata: ${JSON.stringify({ token })}\n\n`);
        }
      );
    } catch (streamErr) {
      // ollama.service.js now includes Ollama's real error body in the
      // message, so we can just forward it directly — no more guessing.
      console.error('Ollama streaming error:', streamErr.message);
      res.write(`event: error\ndata: ${JSON.stringify({ error: streamErr.message })}\n\n`);
      return res.end();
    }

    await chatService.appendMessages(chat.id, [
      userMessage,
      { role: 'assistant', content: fullAnswer, sources },
    ]);

    res.write(`event: done\ndata: ${JSON.stringify({ chatId: chat.id })}\n\n`);
    res.end();
  } catch (err) {
    next(err);
  }
}
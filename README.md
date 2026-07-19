# Local AI Chat — 100% Local RAG + Vision + Speech Chat App

A ChatGPT-style app that runs entirely on your machine via **Ollama** (chat + embeddings + vision) and **ChromaDB** (vector store). No data ever leaves your computer.

## Prerequisites
- Node.js 18+
- [Ollama](https://ollama.com) running locally: `ollama serve`
  - `ollama pull llama3.2`
  - `ollama pull nomic-embed-text`
  - `ollama pull llava` (optional, for image understanding)
- ChromaDB running locally (e.g. `pip install chromadb && chroma run --path ./chroma-data`)

## Setup
```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev          # http://localhost:5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev           # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000` (see `frontend/vite.config.js`).

---

## How RAG works here
1. **Upload** — `PDFUploader.jsx` → `POST /api/upload/pdf`
2. **Extract** — `loaders/pdfLoader.js` pulls text per-page from the PDF
3. **Chunk** — `rag/textSplitter.js` splits each page into overlapping chunks (size/overlap from Settings), tagging each with filename/page/chunkId
4. **Embed + Store** — `vectorstore/vectorstore.service.js` embeds chunks via Ollama (`nomic-embed-text`) and **adds** them to the existing Chroma collection — old PDFs are never touched or rebuilt
5. **Ask a question** (RAG toggle on in `ChatInput.jsx`) — `rag/retriever.js` embeds the question, does similarity search on Chroma via a real LangChain `Retriever`, returns the top-K chunks
6. **Prompt** — `prompts/promptBuilder.js#buildRagPrompt` stuffs those chunks into a system prompt that instructs the model to answer **only** from context, or say plainly that it doesn't know
7. **Generate** — `services/ollama.service.js#streamChat` streams the answer token-by-token back over SSE; `Message.jsx` shows a "Sources" footer citing filename + page for every answer

## How image understanding works
- `ImageUploader.jsx` uploads the file to `POST /api/upload/image`, backend stores it and returns a path — nothing is analyzed yet
- When the user sends their question, `ChatInput.jsx` sets `mode: "image"` and includes that path
- `services/image.service.js#imageToBase64` reads the file and base64-encodes it
- `services/ollama.service.js#streamChat` attaches it to the last user message's `images` array and calls the **vision model** (`llava` by default, configurable via `VISION_MODEL`)

## How audio/speech-to-text works
- `AudioRecorder.jsx` uses the browser's native `MediaRecorder` API to capture mic audio into a Blob — no external recording library
- On stop, it's posted to `POST /api/audio`
- `services/audio.service.js#transcribeAudio` runs it through a **local** Whisper model (via `nodejs-whisper`, wrapping `whisper.cpp`) — fully offline, no cloud STT
- The transcript is returned and dropped straight into the chat text box, exactly like typing it

## Project structure
See `backend/src/{controllers,services,routes,middleware,config,rag,vectorstore,loaders,prompts,utils}` and `frontend/src/{components,pages,api}` — each file has a header comment explaining why it exists and how it connects to the rest of the app.

## API
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/chat` | Streams a chat response (SSE). `mode`: `general` \| `rag` \| `image` |
| POST | `/api/upload/pdf` | Ingest a PDF into the RAG knowledge base |
| DELETE | `/api/upload/pdf/:filename` | Remove a PDF's vectors |
| POST | `/api/upload/image` | Upload an image for a later vision question |
| POST | `/api/audio` | Transcribe recorded audio to text |
| GET/DELETE | `/api/history`, `/api/history/:chatId` | Chat session persistence |
| GET/PUT | `/api/settings` | Models, chunk size/overlap, top K, temperature, max tokens |

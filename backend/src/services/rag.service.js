// services/rag.service.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// The orchestrator that stitches together every RAG piece into the exact
// pipeline described in the spec:
//   Upload PDF -> extract -> chunk -> embed -> store  (ingestPdf)
//   Question -> embed -> similarity search -> top K -> prompt -> LLM (answer)
// Controllers call THIS file, never the lower-level pieces directly — that
// keeps controllers thin and the pipeline testable as a unit.
// -----------------------------------------------------------------------------
import { loadPdf } from '../loaders/pdfLoader.js';
import { splitPagesIntoChunks } from '../rag/textSplitter.js';
import { addChunksToStore, deleteChunksByFilename } from '../vectorstore/vectorstore.service.js';
import { retrieveContext } from '../rag/retriever.js';
import { buildRagPrompt } from '../prompts/promptBuilder.js';

/**
 * Full ingestion pipeline for one uploaded PDF. Runs once per upload and
 * only ever ADDS new vectors — existing PDFs already in Chroma are
 * untouched, satisfying "never rebuild all vectors unless requested".
 */
export async function ingestPdf(filePath, filename) {
  const { pages, numPages } = await loadPdf(filePath);

  const chunks = await splitPagesIntoChunks(pages, {
    filename,
    uploadDate: new Date().toISOString(),
  });

  await addChunksToStore(chunks);

  return { filename, numPages, chunksIndexed: chunks.length };
}

/** Removes a PDF's vectors from the knowledge base (explicit user action). */
export async function removePdf(filename) {
  await deleteChunksByFilename(filename);
}

/**
 * Given a user question, retrieves the top-K relevant chunks and builds the
 * grounded RAG system prompt. Returns both the prompt (for the LLM call)
 * and the raw sources (for the "sources used" UI).
 */
export async function buildRagContext(question) {
  const contextChunks = await retrieveContext(question);
  const systemPrompt = buildRagPrompt(contextChunks);
  return { systemPrompt, sources: contextChunks };
}

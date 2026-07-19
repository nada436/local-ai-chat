// rag/textSplitter.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// A whole PDF is too big to embed as one vector (embeddings work best on
// small, semantically-coherent chunks, and Ollama's context window is
// limited anyway). This wraps LangChain's RecursiveCharacterTextSplitter and
// stamps rich metadata onto every chunk so we can trace a retrieved chunk
// back to its exact source PDF, page, and chunk index.
// -----------------------------------------------------------------------------
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';

/**
 * Splits a loaded PDF's pages into overlapping chunks ready for embedding.
 * @param {{pageNumber: number, text: string}[]} pages
 * @param {{filename: string, uploadDate: string}} meta
 * @returns {Promise<{id: string, text: string, metadata: object}[]>}
 */
export async function splitPagesIntoChunks(pages, meta) {
  const { chunkSize, chunkOverlap } = config.settings;

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  });

  const chunks = [];

  for (const page of pages) {
    if (!page.text?.trim()) continue;

    const pageChunks = await splitter.splitText(page.text);

    pageChunks.forEach((text, idx) => {
      chunks.push({
        id: uuidv4(),
        text,
        metadata: {
          filename: meta.filename,
          uploadDate: meta.uploadDate,
          pageNumber: page.pageNumber,
          chunkId: `${meta.filename}-p${page.pageNumber}-c${idx}`,
        },
      });
    });
  }

  return chunks;
}

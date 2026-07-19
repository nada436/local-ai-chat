// rag/retriever.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// The read-side of RAG: similarity search against Chroma for the top-K
// relevant chunks for a question.
//
// NOTE: we query the Chroma collection directly instead of going through
// `@langchain/community`'s Chroma.asRetriever()/similaritySearch(), because
// that wrapper always sends an empty `where: {}` filter even when none is
// requested — which current ChromaDB server versions reject with
// "InvalidArgumentError: Invalid where clause". Querying the collection
// ourselves (still using the same Ollama-backed embeddings) sidesteps that
// bug entirely while keeping the exact same pipeline: embed question ->
// similarity search -> top K chunks.
// -----------------------------------------------------------------------------
import { OllamaEmbeddings } from '@langchain/ollama';
import { getVectorStore } from '../vectorstore/chroma.client.js';
import { config } from '../config/index.js';

/**
 * Runs similarity search for a question and returns the retrieved chunks
 * together with their source metadata.
 * @param {string} question
 */
export async function retrieveContext(question) {
  const store = await getVectorStore();
  const { topK, embedModel } = config.settings;

  const embeddings = new OllamaEmbeddings({
    model: embedModel,
    baseUrl: config.ollamaBaseUrl,
  });

  const queryEmbedding = await embeddings.embedQuery(question);

  // Query the underlying Chroma collection directly — no `where` clause
  // included at all, which avoids the empty-object bug above.
  const results = await store.collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });

  const documents = results.documents?.[0] || [];
  const metadatas = results.metadatas?.[0] || [];

  return documents.map((text, i) => ({
    text,
    filename: metadatas[i]?.filename,
    pageNumber: metadatas[i]?.pageNumber,
    chunkId: metadatas[i]?.chunkId,
  }));
}
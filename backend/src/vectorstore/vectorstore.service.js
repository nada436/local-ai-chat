// vectorstore/vectorstore.service.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// The write-side of RAG: takes chunks produced by the text splitter and
// upserts them into Chroma. Crucially, this ADDS to the existing collection
// rather than rebuilding it — so uploading a second PDF never touches the
// vectors of the first one. That satisfies the "old PDFs stay indexed,
// never rebuild everything" requirement.
// -----------------------------------------------------------------------------
import { Document } from '@langchain/core/documents';
import { getVectorStore } from './chroma.client.js';

/**
 * Embeds and stores a batch of chunks. Each chunk becomes one LangChain
 * Document; Chroma generates the embedding vector via the configured
 * OllamaEmbeddings instance under the hood.
 * @param {{id: string, text: string, metadata: object}[]} chunks
 */
export async function addChunksToStore(chunks) {
  const store = await getVectorStore();

  const docs = chunks.map(
    (chunk) =>
      new Document({
        pageContent: chunk.text,
        metadata: chunk.metadata,
      })
  );
  const ids = chunks.map((c) => c.id);

  // addDocuments (not a full re-index) is what guarantees incremental
  // updates: previously stored vectors are left untouched.
  await store.addDocuments(docs, { ids });

  return { added: docs.length };
}

/**
 * Removes every vector belonging to one uploaded file — used when a user
 * deletes a PDF from the knowledge base.
 */
export async function deleteChunksByFilename(filename) {
  const store = await getVectorStore();
  await store.collection.delete({ where: { filename } });
}

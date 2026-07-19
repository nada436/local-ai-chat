// prompts/promptBuilder.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// Every place in the app that talks to an LLM needs a *different* system
// prompt shape (plain chat vs grounded-in-context vs "look at this image").
// Centralizing prompt construction here means: (1) no prompt text is
// duplicated across services, (2) the critical anti-hallucination rule for
// RAG lives in exactly one place, easy to audit and tune.
// -----------------------------------------------------------------------------

/** Plain conversational system prompt — no retrieval involved. */
export function buildGeneralPrompt() {
  return `You are a helpful, concise local AI assistant running entirely on the user's machine. Answer clearly and directly.`;
}

/**
 * The RAG system prompt. This is the piece that stops the model from
 * making things up: it is explicitly told to answer ONLY from the supplied
 * context and to say so plainly when the answer isn't in there.
 * @param {{text: string, filename: string, pageNumber: number}[]} contextChunks
 */
export function buildRagPrompt(contextChunks) {
  const contextBlock = contextChunks
    .map(
      (c, i) =>
        `[Source ${i + 1}: ${c.filename}, page ${c.pageNumber}]\n${c.text}`
    )
    .join('\n\n---\n\n');

  return `You are a retrieval-augmented assistant. Use ONLY the context below to answer the user's question.

Rules:
- Answer strictly from the provided context.
- If the answer is not contained in the context, respond exactly: "I don't have that information in the uploaded documents." Do not guess or use outside knowledge.
- When you use a fact from the context, mention which source it came from (filename + page).

Context:
${contextBlock}`;
}

/** System prompt used when an image is attached (vision model call). */
export function buildImagePrompt(userQuestion) {
  return `You are a vision-capable local assistant. Carefully look at the attached image and answer the user's question about it as accurately as possible. If something isn't visible or certain, say so instead of guessing.

User question: ${userQuestion || 'Describe this image in detail.'}`;
}

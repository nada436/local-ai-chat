// server.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// The actual process entry point — just binds `app` to a port. Nothing else
// should go here; all real logic belongs in app.js and below.
// -----------------------------------------------------------------------------
import app from './app.js';
import { config } from './config/index.js';

app.listen(config.port, () => {
  console.log(`Local AI Chat backend running on http://localhost:${config.port}`);
  console.log(`Ollama:  ${config.ollamaBaseUrl}`);
  console.log(`ChromaDB: ${config.chromaUrl}`);
});

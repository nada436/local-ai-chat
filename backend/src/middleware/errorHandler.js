// middleware/errorHandler.js
// -----------------------------------------------------------------------------
// WHY THIS FILE EXISTS
// A single funnel for every error in the app (thrown in a controller, a
// service, or Express itself) so the API always returns a consistent JSON
// shape, and so the specific "Ollama offline" / "ChromaDB offline" cases
// called out in the spec get friendly, actionable messages instead of raw
// stack traces.
// -----------------------------------------------------------------------------
export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  if (err.message?.includes('ECONNREFUSED') && err.message?.includes('11434')) {
    status = 503;
    message = 'Ollama is offline. Start it with `ollama serve` and try again.';
  }
  if (err.message?.includes('ECONNREFUSED') && err.message?.includes('8000')) {
    status = 503;
    message = 'ChromaDB is offline. Start it (e.g. `chroma run`) and try again.';
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'File too large.';
  }

  res.status(status).json({ error: message });
}

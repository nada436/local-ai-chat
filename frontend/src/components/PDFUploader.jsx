// components/PDFUploader.jsx
// -----------------------------------------------------------------------------
// WHY THIS COMPONENT EXISTS
// The frontend half of the RAG ingestion pipeline. Lets the user pick a PDF,
// posts it to /api/upload/pdf (backend extracts -> chunks -> embeds ->
// stores it), and reports back how many chunks were indexed so the user
// has confirmation their document is now searchable.
// -----------------------------------------------------------------------------
import { useRef, useState } from 'react';
import { uploadPdf } from '../api/chatApi.js';

export default function PDFUploader({ onIndexed }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState(null); // 'uploading' | 'done' | 'error'

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setStatus('error');
      return;
    }

    setStatus('uploading');
    try {
      const result = await uploadPdf(file);
      setStatus('done');
      onIndexed?.(result);
    } catch {
      setStatus('error');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={handleChange} />
      <button
        onClick={() => inputRef.current.click()}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-surface-light transition-colors"
        title="Add a PDF to the knowledge base"
      >
        📄 {status === 'uploading' ? 'Indexing…' : 'Upload PDF'}
      </button>
      {status === 'error' && <p className="text-xs text-red-400 px-3">Upload failed — check it's a PDF.</p>}
    </div>
  );
}

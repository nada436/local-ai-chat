// components/ChatInput.jsx
// -----------------------------------------------------------------------------
// WHY THIS COMPONENT EXISTS
// The one place where the three "attachment modes" — RAG toggle, image
// attach, audio record — all converge into a single POST /chat call. It
// decides the `mode` field the backend uses to pick a prompt strategy:
//   - an attached image  -> mode "image"
//   - RAG toggle is on   -> mode "rag"
//   - neither            -> mode "general"
// -----------------------------------------------------------------------------
import { useState } from 'react';
import ImageUploader from './ImageUploader.jsx';
import AudioRecorder from './AudioRecorder.jsx';

export default function ChatInput({ onSend, ragEnabled, onToggleRag, disabled }) {
  const [text, setText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);

  function handleSend() {
    if (!text.trim() && !attachedImage) return;

    const mode = attachedImage ? 'image' : ragEnabled ? 'rag' : 'general';
    onSend({ message: text, mode, imagePath: attachedImage?.imagePath });

    setText('');
    setAttachedImage(null);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-white/10 p-4">
      {attachedImage && (
        <div className="mb-2 flex items-center gap-2">
          <img src={attachedImage.previewUrl} alt="attached" className="h-14 w-14 object-cover rounded-lg" />
          <button onClick={() => setAttachedImage(null)} className="text-xs text-neutral-400 hover:text-neutral-200">
            Remove
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-surface rounded-2xl px-3 py-2">
        <button
          onClick={onToggleRag}
          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
            ragEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'text-neutral-400 hover:bg-surface-light'
          }`}
          title="Answer using your uploaded PDFs (RAG)"
        >
          📚 RAG
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message"
          className="flex-1 bg-transparent resize-none outline-none placeholder:text-neutral-500 py-1.5 max-h-40"
        />

        <ImageUploader onAttached={setAttachedImage} />
        <AudioRecorder onTranscribed={(t) => setText((prev) => (prev ? prev + ' ' + t : t))} />

        <button
          onClick={handleSend}
          disabled={disabled}
          className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition-colors"
          title="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

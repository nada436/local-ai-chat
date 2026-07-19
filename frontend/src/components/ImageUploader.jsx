// components/ImageUploader.jsx
// -----------------------------------------------------------------------------
// WHY THIS COMPONENT EXISTS
// Frontend half of image understanding. Unlike PDFs (which get indexed
// immediately), an image is only UPLOADED here — the backend stores it and
// returns its path. The actual vision-model call happens later, when the
// user sends their question, via ChatInput passing mode="image" +
// imagePath to /api/chat. This mirrors how ChatGPT lets you attach an
// image, then still type a question about it before sending.
// -----------------------------------------------------------------------------
import { useRef, useState } from 'react';
import { uploadImage } from '../api/chatApi.js';

export default function ImageUploader({ onAttached }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    const result = await uploadImage(file);
    onAttached?.({ imagePath: result.imagePath, previewUrl: URL.createObjectURL(file) });
    e.target.value = '';
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg" hidden onChange={handleChange} />
      <button
        onClick={() => inputRef.current.click()}
        className="p-2 rounded-lg hover:bg-surface-light transition-colors"
        title="Attach an image"
      >
        🖼️
      </button>
    </div>
  );
}

// pages/Settings.jsx
// Exposes every tunable from the spec: chat/embedding model names, chunk
// size/overlap, top K, temperature, max tokens — all persisted server-side
// via PUT /api/settings (see config/index.js + settings.controller.js).
import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../api/chatApi.js';

const FIELDS = [
  { key: 'chatModel', label: 'Chat Model', type: 'text' },
  { key: 'embedModel', label: 'Embedding Model', type: 'text' },
  { key: 'visionModel', label: 'Vision Model', type: 'text' },
  { key: 'chunkSize', label: 'Chunk Size', type: 'number' },
  { key: 'chunkOverlap', label: 'Chunk Overlap', type: 'number' },
  { key: 'topK', label: 'Top K Retrieval', type: 'number' },
  { key: 'temperature', label: 'Temperature', type: 'number', step: '0.1' },
  { key: 'maxTokens', label: 'Max Tokens', type: 'number' },
];

export default function Settings() {
  const [values, setValues] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setValues);
  }, []);

  if (!values) return <div className="p-6 text-neutral-400">Loading…</div>;

  async function handleSave() {
    await updateSettings(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="max-w-lg mx-auto p-8 space-y-5">
      <h1 className="text-xl font-semibold mb-4">Settings</h1>
      {FIELDS.map((f) => (
        <div key={f.key} className="flex flex-col gap-1">
          <label className="text-sm text-neutral-400">{f.label}</label>
          <input
            type={f.type}
            step={f.step}
            value={values[f.key]}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value,
              }))
            }
            className="bg-surface-light rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      ))}
      <button onClick={handleSave} className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors">
        {saved ? 'Saved ✓' : 'Save Settings'}
      </button>
    </div>
  );
}

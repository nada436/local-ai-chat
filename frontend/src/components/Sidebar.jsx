// components/Sidebar.jsx
// Left rail: new chat, PDF uploader (feeds the RAG knowledge base), chat
// history list, settings link — matches the spec's sidebar layout.
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ChatHistory from './ChatHistory.jsx';
import PDFUploader from './PDFUploader.jsx';

export default function Sidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <aside className="w-64 shrink-0 bg-surface flex flex-col border-r border-white/10">
      <div className="p-3 space-y-1">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-surface-light hover:bg-white/10 transition-colors"
        >
          ✚ New Chat
        </button>
        <PDFUploader onIndexed={() => queryClient.invalidateQueries({ queryKey: ['history'] })} />
      </div>

      <ChatHistory />

      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-surface-light transition-colors"
        >
          ⚙️ Settings
        </button>
      </div>
    </aside>
  );
}

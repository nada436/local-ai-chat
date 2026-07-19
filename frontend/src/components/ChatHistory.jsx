// components/ChatHistory.jsx
// List of past chat sessions in the sidebar, with delete support.
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchHistory, deleteChat } from '../api/chatApi.js';

export default function ChatHistory() {
  const { data: chats = [] } = useQuery({ queryKey: ['history'], queryFn: fetchHistory });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { chatId } = useParams();

  async function handleDelete(e, id) {
    e.stopPropagation();
    await deleteChat(id);
    queryClient.invalidateQueries({ queryKey: ['history'] });
    if (chatId === id) navigate('/');
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-1 px-2">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => navigate(`/chat/${chat.id}`)}
          className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer truncate ${
            chatId === chat.id ? 'bg-surface-light' : 'hover:bg-surface-light/60'
          }`}
        >
          <span className="truncate">{chat.title}</span>
          <button
            onClick={(e) => handleDelete(e, chat.id)}
            className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 text-xs"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

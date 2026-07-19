// components/ChatWindow.jsx
// -----------------------------------------------------------------------------
// WHY THIS COMPONENT EXISTS
// Owns the actual conversation state for the currently open chat: the list
// of finished messages, the in-flight streaming buffer, and driving
// sendChatMessage's SSE callbacks (onMeta -> capture sources/chatId,
// onToken -> append to the streaming buffer, onDone -> commit it as a
// finished message).
// -----------------------------------------------------------------------------
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchChat, sendChatMessage } from '../api/chatApi.js';
import Message from './Message.jsx';
import StreamingMessage from './StreamingMessage.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import ChatInput from './ChatInput.jsx';

export default function ChatWindow() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [ragEnabled, setRagEnabled] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchChat(chatId).then((chat) => setMessages(chat.messages));
    } else {
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  async function handleSend({ message, mode, imagePath }) {
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setWaiting(true);
    setStreaming('');

    let buffer = '';
    let currentSources = [];

    try {
      await sendChatMessage(
        { chatId, message, mode, imagePath },
        {
          onMeta: ({ chatId: newChatId, sources }) => {
            currentSources = sources || [];
            if (!chatId && newChatId) navigate(`/chat/${newChatId}`, { replace: true });
          },
          onToken: (token) => {
            setWaiting(false);
            buffer += token;
            setStreaming(buffer);
          },
          onDone: () => {
            setMessages((prev) => [...prev, { role: 'assistant', content: buffer, sources: currentSources }]);
            setStreaming('');
          },
        }
      );
    } catch (err) {
      setWaiting(false);
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${err.message}` }]);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && !streaming && (
          <div className="h-full flex items-center justify-center text-neutral-500">
            Start a conversation — toggle 📚 RAG to ask questions about your uploaded PDFs.
          </div>
        )}
        {messages.map((m, i) => (
          <Message key={i} role={m.role} content={m.content} sources={m.sources} />
        ))}
        {waiting && <TypingIndicator />}
        {streaming && <StreamingMessage content={streaming} />}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={handleSend} ragEnabled={ragEnabled} onToggleRag={() => setRagEnabled((v) => !v)} disabled={waiting} />
    </div>
  );
}

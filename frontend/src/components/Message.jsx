// components/Message.jsx
// Renders one finished message. Markdown + code highlighting per spec, and
// — the RAG-specific bit — a "Sources" footer listing which PDF/page each
// answer was grounded in, so the user can verify the model isn't making
// things up.
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Message({ role, content, sources }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-2xl rounded-2xl px-4 py-3 ${isUser ? 'bg-blue-600 text-white' : 'bg-surface-light text-neutral-100'}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-black/30 px-1 rounded" {...props}>{children}</code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>

        {sources?.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10 text-xs text-neutral-400 space-y-0.5">
            <p className="font-semibold">Sources:</p>
            {sources.map((s, i) => (
              <p key={i}>📄 {s.filename} — page {s.pageNumber}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

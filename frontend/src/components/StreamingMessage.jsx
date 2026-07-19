// components/StreamingMessage.jsx
// Renders the in-progress assistant reply while tokens are still arriving
// over SSE. Kept separate from Message.jsx because it needs a blinking
// cursor and re-renders on every single token — isolating that churn here
// avoids re-rendering the whole message list on every token.
export default function StreamingMessage({ content }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-2xl rounded-2xl px-4 py-3 bg-surface-light text-neutral-100 whitespace-pre-wrap">
        {content}
        <span className="inline-block w-2 h-4 ml-0.5 bg-neutral-300 animate-pulse align-middle" />
      </div>
    </div>
  );
}

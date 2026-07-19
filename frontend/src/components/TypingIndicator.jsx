// components/TypingIndicator.jsx
// Shown briefly between "message sent" and "first token received".
export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-1 px-4 py-3 rounded-2xl bg-surface-light">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

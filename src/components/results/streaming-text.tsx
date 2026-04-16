"use client";

interface StreamingTextProps {
  content: string;
  isStreaming?: boolean;
}

/**
 * Renders streamed markdown-like content with dramatic styling.
 */
export function StreamingText({ content, isStreaming = true }: StreamingTextProps) {
  if (!content) return null;

  const lines = content.split("\n");

  return (
    <div className="prose prose-invert prose-sm max-w-none space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (!trimmed) return <div key={i} className="h-2" />;

        // ## Header → mini section-card style
        if (trimmed.startsWith("## ")) {
          return (
            <div key={i} className="mt-8 mb-3">
              <h3 className="font-display text-lg font-bold text-gradient-gold">
                {trimmed.slice(3)}
              </h3>
              <div
                className="h-px mt-2"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(212,175,55,0.5), transparent)",
                }}
              />
            </div>
          );
        }

        // ### Sub-header
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={i} className="text-base font-semibold text-text-primary font-display mt-5 mb-1">
              {trimmed.slice(4)}
            </h4>
          );
        }

        // Numbered list
        if (/^\d+\./.test(trimmed)) {
          return (
            <p key={i} className="text-text-primary pl-2">
              {formatInlineText(trimmed)}
            </p>
          );
        }

        // Bullet list
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <p key={i} className="text-text-primary pl-4">
              <span className="text-accent mr-2">&#8226;</span>
              {formatInlineText(trimmed.slice(2))}
            </p>
          );
        }

        // Regular paragraph
        return (
          <p key={i} className="text-text-primary/90 leading-relaxed">
            {formatInlineText(trimmed)}
          </p>
        );
      })}
      {/* Gold pulsing cursor — only during streaming */}
      {isStreaming && <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse-glow ml-1" />}
    </div>
  );
}

function formatInlineText(text: string): React.ReactNode {
  // Handle **bold**, [근거: ...] evidence tags
  const parts = text.split(/(\*\*[^*]+\*\*|\[근거:[^\]]+\])/g);

  return parts.map((part, i) => {
    // Bold → gold gradient
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-gradient-gold font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Evidence tag → inline badge
    if (part.startsWith("[근거:") && part.endsWith("]")) {
      return (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-full bg-primary/20 border border-primary/30 px-2 py-0.5 text-[11px] text-primary-glow mx-1"
        >
          <span className="text-accent">&#9670;</span>
          {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
}

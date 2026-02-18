"use client";

interface StreamingTextProps {
  content: string;
}

/**
 * Renders streamed markdown-like content with basic formatting.
 */
export function StreamingText({ content }: StreamingTextProps) {
  if (!content) return null;

  const lines = content.split("\n");

  return (
    <div className="prose prose-invert prose-sm max-w-none space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (!trimmed) return <div key={i} className="h-2" />;

        // ## Header
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={i} className="text-lg font-bold text-accent mt-6 mb-2">
              {trimmed.slice(3)}
            </h3>
          );
        }

        // ### Sub-header
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={i} className="text-base font-semibold text-text-primary mt-4 mb-1">
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
      {/* Blinking cursor while streaming */}
      <span className="inline-block w-0.5 h-4 bg-accent animate-pulse" />
    </div>
  );
}

function formatInlineText(text: string): React.ReactNode {
  // Handle **bold** and 한자(한글) patterns
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-accent font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

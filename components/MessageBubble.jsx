/**
 * Renders a single chat bubble.
 *
 * Props
 * ─────
 * role     "user" | "assistant"
 * content  string — supports **bold** markdown syntax
 */

const LIGHT_BLUE = "#D6E4F0";
const NAVY       = "#1B3A6B";

/**
 * Converts **bold** markdown tokens to <strong> elements.
 * Only handles bold to keep the renderer simple and safe.
 */
function renderMarkdown(text) {
  if (!text) return null;

  // Split on **…** tokens, alternating plain / bold segments
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Preserve newlines as <br> within plain segments
    const lines = part.split("\n");
    return lines.map((line, j) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < lines.length - 1 && <br />}
      </span>
    ));
  });
}

export default function MessageBubble({ role, content }) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
        <div
          style={{
            maxWidth:     "72%",
            background:   "#EAEAEA",
            color:        "#1A2B3C",
            borderRadius: "18px 18px 4px 18px",
            padding:      "10px 14px",
            fontSize:     "0.875rem",
            lineHeight:   1.6,
            wordBreak:    "break-word",
          }}
        >
          {renderMarkdown(content)}
        </div>
      </div>
    );
  }

  // Pathfinder (assistant) bubble
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "4px" }}>
      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: "4px" }}>
        {/* "Pathfinder" label */}
        <span
          style={{
            fontSize:      "0.68rem",
            fontWeight:    700,
            color:         NAVY,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            paddingLeft:   "4px",
          }}
        >
          Pathfinder
        </span>
        <div
          style={{
            background:   LIGHT_BLUE,
            color:        "#1A2B3C",
            borderRadius: "4px 18px 18px 18px",
            padding:      "10px 14px",
            fontSize:     "0.875rem",
            lineHeight:   1.6,
            wordBreak:    "break-word",
          }}
        >
          {renderMarkdown(content)}
        </div>
      </div>
    </div>
  );
}

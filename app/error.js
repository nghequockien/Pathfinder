"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #F5F7FA 0%, #E8EEF5 100%)",
          padding: "24px",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "760px",
            background: "#FFFFFF",
            border: "1px solid #D6E4F0",
            borderRadius: "14px",
            boxShadow: "0 8px 32px rgba(27,58,107,0.12)",
            padding: "24px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#1B3A6B",
              fontSize: "1.5rem",
              fontWeight: 800,
            }}
          >
            Unexpected application error
          </h2>
          <p
            style={{
              marginTop: "10px",
              marginBottom: "16px",
              color: "#37516D",
              lineHeight: 1.6,
            }}
          >
            Pathfinder could not render this page. Details are shown below.
          </p>
          <pre
            style={{
              margin: 0,
              background: "#F8FAFC",
              border: "1px solid #DDE7F2",
              borderRadius: "10px",
              padding: "14px",
              color: "#1A2B3C",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
              fontSize: "0.84rem",
              lineHeight: 1.55,
            }}
          >
            {error?.message || "Unknown error"}
          </pre>
          <div style={{ marginTop: "16px" }}>
            <button
              onClick={reset}
              style={{
                background: "#4A90C4",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

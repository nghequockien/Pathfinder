"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import {
  createInitialState,
  parseStateFromResponse,
  stripStateBlock,
} from "@/lib/pathfinder-agent";

const SIDEBAR_WIDTH = 260;

function ErrorPage({ message, onRetry }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F5F7FA 0%, #E8EEF5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
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
        <h1
          style={{
            margin: 0,
            color: "#1B3A6B",
            fontSize: "1.5rem",
            fontWeight: 800,
          }}
        >
          Pathfinder encountered an error
        </h1>
        <p
          style={{
            marginTop: "10px",
            marginBottom: "16px",
            color: "#37516D",
            lineHeight: 1.6,
          }}
        >
          The session cannot continue right now. The error message is shown
          below.
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
          {message || "Unknown error"}
        </pre>
        <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
          <button
            onClick={onRetry}
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
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

function getErrorMessageFromResponse(data, status) {
  if (data && typeof data.error === "string" && data.error.trim()) {
    return data.error.trim();
  }
  return `Server error ${status}`;
}

/** Derives which phases are fully complete from the current phase number. */
function completedPhases(phase) {
  return Array.from({ length: phase - 1 }, (_, i) => i + 1);
}

/**
 * Returns true when the privacy answer exists and does not indicate
 * that there are no privacy concerns.
 */
function derivePrivacyFlag(agentState) {
  const answer = agentState?.answers?.privacy;
  if (!answer) return false;
  const lower = answer.toLowerCase().trim();
  return !(
    lower === "no" ||
    lower === "none" ||
    lower === "n/a" ||
    lower === "no concerns"
  );
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [agentState, setAgentState] = useState(createInitialState());
  const [loading, setLoading] = useState(false);
  const [fatalError, setFatalError] = useState(null);

  // Prevent double-firing of the greeting in React strict mode
  const greetingFired = useRef(false);

  // ── Initial greeting ───────────────────────────────────────────────────────
  useEffect(() => {
    if (greetingFired.current) return;
    greetingFired.current = true;

    async function fetchGreeting() {
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [],
            agentState: createInitialState(),
          }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(getErrorMessageFromResponse(data, res.status));
        if (data.reply) {
          const parsed = parseStateFromResponse(data.reply);
          const visibleText = stripStateBlock(data.reply);
          setMessages([{ role: "assistant", content: visibleText }]);
          if (parsed) setAgentState(parsed);
        }
      } catch (err) {
        console.error("Greeting error:", err);
        setFatalError(err?.message || "Unknown error while starting session.");
      } finally {
        setLoading(false);
      }
    }

    fetchGreeting();
  }, []);

  // ── Send handler (passed to ChatWindow) ───────────────────────────────────
  const handleSend = useCallback(
    async (text) => {
      if (!text.trim() || loading) return;

      const userMsg = { role: "user", content: text.trim() };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages, agentState }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(getErrorMessageFromResponse(data, res.status));

        if (data.reply) {
          const parsed = parseStateFromResponse(data.reply);
          const visibleText = stripStateBlock(data.reply);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: visibleText },
          ]);
          if (parsed) setAgentState(parsed);
        }
      } catch (err) {
        console.error("Chat error:", err);
        setFatalError(err?.message || "Unknown error while sending message.");
      } finally {
        setLoading(false);
      }
    },
    [messages, agentState, loading],
  );

  // ── Derived sidebar props ─────────────────────────────────────────────────
  const privacyFlagged = derivePrivacyFlag(agentState);

  if (fatalError) {
    return (
      <ErrorPage
        message={fatalError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#F5F7FA",
        overflow: "hidden",
      }}
    >
      {/* Fixed sidebar */}
      <Sidebar
        currentPhase={agentState.phase}
        completedPhases={completedPhases(agentState.phase)}
        privacyFlagged={privacyFlagged}
      />

      {/* Main content — offset by sidebar width */}
      <main
        style={{
          marginLeft: `${SIDEBAR_WIDTH}px`,
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ChatWindow
          messages={messages}
          agentState={agentState}
          loading={loading}
          onSend={handleSend}
        />
      </main>
    </div>
  );
}

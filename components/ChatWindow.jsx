"use client";

import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { generatePackage } from "@/lib/generate-package";

const ACCENT_BLUE = "#4A90C4";
const NAVY        = "#1B3A6B";
const LIGHT_BLUE  = "#D6E4F0";

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "4px" }}>
      <div
        style={{
          background:   LIGHT_BLUE,
          borderRadius: "4px 18px 18px 18px",
          padding:      "12px 16px",
          display:      "flex",
          alignItems:   "center",
          gap:          "5px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width:          "7px",
              height:         "7px",
              borderRadius:   "50%",
              background:     NAVY,
              opacity:        0.5,
              display:        "inline-block",
              animation:      "pf-bounce 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes pf-bounce {
            0%, 80%, 100% { transform: translateY(0);    opacity: 0.35; }
            40%            { transform: translateY(-5px); opacity: 1;    }
          }
        `}</style>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * Props
 * ─────
 * messages    {Array}   — full message history from page.js
 * agentState  {Object}  — current Pathfinder phase state from page.js
 * loading     {boolean} — true while waiting for a reply
 * onSend      {Function(text: string)} — called when the user submits a message
 */
export default function ChatWindow({ messages = [], agentState = {}, loading = false, onSend }) {
  const [input, setInput] = useState("");

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to latest message or typing indicator
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    onSend?.(text);
    setInput("");
    textareaRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleDownload() {
    const session = {
      project_title:       agentState.answers?.goal
                             ? `AI Project: ${agentState.answers.goal.slice(0, 60)}`
                             : "Pathfinder Decision Package",
      generated_at:        new Date().toISOString(),
      privacy_flag:        !!(agentState.answers?.privacy &&
                               !["no", "none", "n/a", "no concerns"].includes(
                                 agentState.answers.privacy.toLowerCase().trim()
                               )),
      answers:             agentState.answers ?? {},
      solution_path:       agentState.solutionPath,
      solution_reason:     agentState.solutionReason,
      user_stories:        agentState.userStories        ?? [],
      backlog:             agentState.backlog             ?? [],
      skill_suggestions:   agentState.skillSuggestions   ?? [],
      platform_reuse:      agentState.platformReuse      ?? [],
      gate_a_approved:     agentState.gateAApproved      ?? false,
      gate_b_approved:     agentState.gateBApproved      ?? false,
      case_for_management: agentState.caseForManagement  ?? null,
    };

    const html = generatePackage(session);
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "pathfinder-decision-package.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  const isPhase5     = agentState.phase === 5 || agentState.decisionPackageReady;
  const sendDisabled = loading || !input.trim();

  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        height:        "100vh",
        background:    "#F5F7FA",
      }}
    >
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <header
        style={{
          background:    "#FFFFFF",
          borderBottom:  "1px solid #C8D9ED",
          padding:       "14px 24px",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"space-between",
          flexShrink:    0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: NAVY }}>
            Discovery Session
          </span>
          <span
            style={{
              fontSize:     "0.75rem",
              color:        NAVY,
              background:   LIGHT_BLUE,
              padding:      "2px 10px",
              borderRadius: "999px",
              fontWeight:   600,
            }}
          >
            Phase {agentState.phase ?? 1} of 5
          </span>
          {agentState.mode && (
            <span
              style={{
                fontSize:     "0.72rem",
                color:        "#FFFFFF",
                background:   agentState.mode === "fast-track" ? "#7B61FF" : ACCENT_BLUE,
                padding:      "2px 10px",
                borderRadius: "999px",
                fontWeight:   600,
                textTransform:"capitalize",
              }}
            >
              {agentState.mode === "fast-track" ? "Fast Track" : "Guided"} Mode
            </span>
          )}
        </div>

        {isPhase5 && (
          <button
            onClick={handleDownload}
            style={{
              background:   ACCENT_BLUE,
              color:        "#FFFFFF",
              border:       "none",
              borderRadius: "8px",
              padding:      "8px 18px",
              fontSize:     "0.82rem",
              fontWeight:   700,
              cursor:       "pointer",
              display:      "flex",
              alignItems:   "center",
              gap:          "7px",
              boxShadow:    `0 2px 8px ${ACCENT_BLUE}55`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            ⬇ Download Decision Package
          </button>
        )}
      </header>

      {/* ── Message list ──────────────────────────────────────────────────── */}
      <div
        style={{
          flex:          1,
          overflowY:     "auto",
          padding:       "24px 28px",
          display:       "flex",
          flexDirection: "column",
          gap:           "2px",
        }}
      >
        {messages.length === 0 && !loading && (
          <div
            style={{
              margin:    "auto",
              textAlign: "center",
              color:     "#8098B0",
              fontSize:  "0.875rem",
              maxWidth:  "320px",
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🧭</div>
            <strong style={{ color: NAVY, display: "block", marginBottom: "6px" }}>
              Starting Pathfinder…
            </strong>
            Your discovery session is loading.
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {loading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ────────────────────────────────────────────────────── */}
      <div
        style={{
          background:  "#FFFFFF",
          borderTop:   "1px solid #C8D9ED",
          padding:     "14px 20px",
          display:     "flex",
          gap:         "10px",
          alignItems:  "flex-end",
          flexShrink:  0,
        }}
      >
        <textarea
          ref={textareaRef}
          rows={2}
          placeholder={
            loading
              ? "Pathfinder is responding…"
              : "Type a message… (Enter to send, Shift+Enter for new line)"
          }
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={(e) => { if (!loading) e.target.style.borderColor = ACCENT_BLUE; }}
          onBlur={(e)  => { e.target.style.borderColor = loading ? "#C8D9ED" : "#A8C4DC"; }}
          style={{
            flex:        1,
            border:      `1px solid ${loading ? "#C8D9ED" : "#A8C4DC"}`,
            borderRadius:"10px",
            padding:     "10px 14px",
            fontSize:    "0.875rem",
            lineHeight:  1.5,
            resize:      "none",
            outline:     "none",
            fontFamily:  "inherit",
            color:       "#1A2B3C",
            background:  loading ? "#F8FAFB" : "#FFFFFF",
            transition:  "border-color 0.15s",
          }}
        />
        <button
          onClick={handleSend}
          disabled={sendDisabled}
          style={{
            background:   sendDisabled ? "#C8D9ED" : ACCENT_BLUE,
            color:        sendDisabled ? "#8098B0" : "#FFFFFF",
            border:       "none",
            borderRadius: "10px",
            padding:      "0 20px",
            fontSize:     "0.875rem",
            fontWeight:   700,
            cursor:       sendDisabled ? "not-allowed" : "pointer",
            transition:   "background 0.15s, color 0.15s",
            flexShrink:   0,
            height:       "44px",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

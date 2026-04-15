"use client";

const PHASES = [
  { number: 1, label: "Smart Apprentice",    sub: "Introduction & mode selection" },
  { number: 2, label: "Discovery Questions", sub: "6 questions about your project" },
  { number: 3, label: "User Stories",        sub: "Draft, refine & accept stories" },
  { number: 4, label: "Governance Gates",    sub: "Sign-off & budget check" },
  { number: 5, label: "Decision Package",    sub: "Download your package" },
];

// Brand colours kept as inline constants so the sidebar has no Tailwind
// colour dependencies that would require config changes.
const NAVY       = "#1B3A6B";
const BLUE       = "#4A90C4";
const LIGHT_BLUE = "#D6E4F0";

/**
 * Props
 * ─────
 * currentPhase    {number}  1–5, which phase is active
 * completedPhases {number[]} phases that are fully done (show green ✓)
 * privacyFlagged  {boolean}  true → show red privacy indicator at bottom
 */
export default function Sidebar({
  currentPhase    = 1,
  completedPhases = [],
  privacyFlagged  = false,
}) {
  return (
    <aside
      style={{
        width:           "260px",
        minWidth:        "260px",
        height:          "100vh",
        position:        "fixed",
        top:             0,
        left:            0,
        background:      NAVY,
        display:         "flex",
        flexDirection:   "column",
        overflowY:       "auto",
        zIndex:          50,
      }}
    >
      {/* ── Logo / Brand ── */}
      <div
        style={{
          padding:      "28px 20px 24px",
          borderBottom: `1px solid rgba(255,255,255,0.1)`,
        }}
      >
        <div
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        "10px",
          }}
        >
          {/* Icon mark */}
          <div
            style={{
              width:          "36px",
              height:         "36px",
              borderRadius:   "8px",
              background:     BLUE,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              flexShrink:     0,
              fontSize:       "1.1rem",
            }}
          >
            🧭
          </div>
          <div>
            <div
              style={{
                color:       "#FFFFFF",
                fontWeight:  800,
                fontSize:    "1.05rem",
                lineHeight:  1.2,
                letterSpacing: "0.01em",
              }}
            >
              Pathfinder
            </div>
            <div
              style={{
                color:      LIGHT_BLUE,
                fontSize:   "0.68rem",
                fontWeight: 500,
                marginTop:  "2px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              AI Discovery Partner
            </div>
          </div>
        </div>
      </div>

      {/* ── Phase list ── */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <p
          style={{
            color:         "rgba(214,228,240,0.5)",
            fontSize:      "0.67rem",
            fontWeight:    700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin:        "0 0 10px 8px",
          }}
        >
          Phases
        </p>

        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
          {PHASES.map(({ number, label, sub }) => {
            const isActive    = currentPhase === number;
            const isCompleted = completedPhases.includes(number);
            const isFuture    = !isActive && !isCompleted;

            return (
              <li key={number}>
                <div
                  style={{
                    display:       "flex",
                    alignItems:    "flex-start",
                    gap:           "12px",
                    padding:       "10px 10px",
                    borderRadius:  "8px",
                    background:    isActive    ? `${BLUE}33`
                                 : isCompleted ? "rgba(255,255,255,0.05)"
                                 : "transparent",
                    border:        isActive
                                     ? `1px solid ${BLUE}88`
                                     : "1px solid transparent",
                    transition:    "background 0.15s",
                  }}
                >
                  {/* Number badge / checkmark */}
                  <div
                    style={{
                      width:          "26px",
                      height:         "26px",
                      borderRadius:   "50%",
                      flexShrink:     0,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      fontSize:       isCompleted ? "0.85rem" : "0.72rem",
                      fontWeight:     700,
                      marginTop:      "1px",
                      background:     isActive    ? BLUE
                                    : isCompleted ? "#1E7E34"
                                    : "rgba(255,255,255,0.1)",
                      color:          isFuture
                                        ? "rgba(255,255,255,0.4)"
                                        : "#FFFFFF",
                    }}
                  >
                    {isCompleted ? "✓" : number}
                  </div>

                  {/* Label + sub-label */}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        color:      isActive    ? "#FFFFFF"
                                  : isCompleted ? "rgba(255,255,255,0.85)"
                                  : "rgba(255,255,255,0.45)",
                        fontWeight: isActive ? 700 : 500,
                        fontSize:   "0.83rem",
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        overflow:   "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        color:    isActive
                                    ? LIGHT_BLUE
                                    : "rgba(214,228,240,0.35)",
                        fontSize: "0.7rem",
                        marginTop: "2px",
                        lineHeight: 1.3,
                      }}
                    >
                      {sub}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Privacy flag indicator ── */}
      <div
        style={{
          margin:       "0 12px 12px",
          borderRadius: "8px",
          padding:      "12px 14px",
          background:   privacyFlagged
                          ? "rgba(192,57,43,0.18)"
                          : "rgba(255,255,255,0.05)",
          border:       `1px solid ${privacyFlagged ? "#C0392B" : "rgba(255,255,255,0.08)"}`,
          transition:   "all 0.2s",
        }}
      >
        <div
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        "8px",
          }}
        >
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>
            {privacyFlagged ? "🔴" : "🔒"}
          </span>
          <div>
            <div
              style={{
                fontSize:   "0.75rem",
                fontWeight: 700,
                color:      privacyFlagged ? "#FF6B6B" : "rgba(255,255,255,0.5)",
                lineHeight: 1.3,
              }}
            >
              {privacyFlagged ? "Privacy Flag Active" : "Privacy & Compliance"}
            </div>
            <div
              style={{
                fontSize:  "0.67rem",
                color:     privacyFlagged ? "rgba(255,107,107,0.8)" : "rgba(255,255,255,0.3)",
                marginTop: "2px",
                lineHeight: 1.3,
              }}
            >
              {privacyFlagged
                ? "Review required before proceeding"
                : "No concerns flagged yet"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          padding:    "12px 20px",
          borderTop:  "1px solid rgba(255,255,255,0.08)",
          fontSize:   "0.67rem",
          color:      "rgba(214,228,240,0.3)",
          letterSpacing: "0.02em",
        }}
      >
        Pathfinder Demo &bull; v0.1
      </div>
    </aside>
  );
}

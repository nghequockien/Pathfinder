// ─────────────────────────────────────────────
// Pathfinder — Decision Package Generator
// Takes a completed session object and returns a
// self-contained HTML string ready for download.
// ─────────────────────────────────────────────

/**
 * @typedef {Object} Session
 * @property {string}   project_title        - Name / short title of the project
 * @property {string}   generated_at         - ISO timestamp
 * @property {boolean}  privacy_flag         - True if Q4 raised privacy concerns
 * @property {Object}   answers              - The 6 discovery answers keyed by question
 * @property {string}   answers.goal
 * @property {string}   answers.users
 * @property {string}   answers.data
 * @property {string}   answers.privacy
 * @property {string}   answers.integration
 * @property {string}   answers.budget
 * @property {string}   solution_path        - "RAG Pipeline" | "AI Agent" | "LLM+Template"
 * @property {string}   solution_reason      - Plain-English explanation of recommendation
 * @property {Array}    user_stories         - [{title, story, acceptance_criteria, version}]
 * @property {Array}    backlog              - [{priority, task, rationale}]
 * @property {Array}    skill_suggestions    - [{role, skills, rationale}]
 * @property {Array}    platform_reuse       - [{platform, opportunity, evidence}]
 * @property {boolean}  gate_a_approved
 * @property {boolean}  gate_b_approved
 * @property {string}   [case_for_management] - Present if budget was not confirmed
 */

// ── Brand tokens ─────────────────────────────
const BRAND = {
  navy:       "#1B3A6B",
  blue:       "#4A90C4",
  lightBlue:  "#D6E4F0",
  white:      "#FFFFFF",
  bodyBg:     "#F4F7FB",
  textDark:   "#1A2B3C",
  textMid:    "#4A5568",
  border:     "#C8D9ED",
  privacyRed: "#C0392B",
  privacyAmb: "#E67E22",
  privacyBg:  "#FDF2F2",
  successGrn: "#1E7E34",
  successBg:  "#EAF7EC",
  tagBg:      "#EBF4FA",
};

// ── Helpers ───────────────────────────────────

function esc(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso ?? "";
  }
}

function pill(text, color = BRAND.blue) {
  return `<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:0.72rem;font-weight:600;letter-spacing:.03em;background:${color}22;color:${color};border:1px solid ${color}44">${esc(text)}</span>`;
}

function sectionCard(id, title, icon, content) {
  return `
  <section id="${id}" style="background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:12px;padding:28px 32px;margin-bottom:24px;page-break-inside:avoid">
    <h2 style="margin:0 0 20px;font-size:1.05rem;font-weight:700;color:${BRAND.navy};display:flex;align-items:center;gap:10px;border-bottom:2px solid ${BRAND.lightBlue};padding-bottom:12px">
      <span style="font-size:1.2rem">${icon}</span>${esc(title)}
    </h2>
    ${content}
  </section>`;
}

function dl(pairs) {
  // pairs: [[label, value], ...]
  const rows = pairs
    .filter(([, v]) => v != null && v !== "")
    .map(([label, value]) => `
      <div style="display:grid;grid-template-columns:160px 1fr;gap:8px 16px;padding:10px 0;border-bottom:1px solid ${BRAND.border}">
        <dt style="font-weight:600;color:${BRAND.textMid};font-size:0.82rem;text-transform:uppercase;letter-spacing:.04em;padding-top:2px">${esc(label)}</dt>
        <dd style="margin:0;color:${BRAND.textDark};font-size:0.9rem;line-height:1.6">${esc(value)}</dd>
      </div>`)
    .join("");
  return `<dl style="margin:0">${rows}</dl>`;
}

// ── Section builders ──────────────────────────

function buildDisclaimer() {
  return `
  <div style="background:${BRAND.navy};color:${BRAND.white};border-radius:10px;padding:14px 24px;margin-bottom:28px;display:flex;align-items:center;gap:14px;font-size:0.85rem">
    <span style="font-size:1.3rem;flex-shrink:0">⚠️</span>
    <span><strong>Notice:</strong> This package was drafted by Pathfinder. All decisions remain with the human expert team. No action should be taken without appropriate review and sign-off.</span>
  </div>`;
}

function buildConversationNotes(session) {
  const a = session.answers ?? {};
  const content = dl([
    ["Project",     session.project_title],
    ["Goal",        a.goal],
    ["Users",       a.users],
    ["Data sources",a.data],
    ["Integration", a.integration],
    ["Budget",      a.budget],
  ]);
  return sectionCard("conversation-notes", "Conversation Notes", "📋", content);
}

function buildPrivacyFlag(session) {
  const flagged = !!session.privacy_flag;
  const answer  = session.answers?.privacy ?? "No privacy information recorded.";

  if (flagged) {
    const content = `
      <div style="background:${BRAND.privacyBg};border-left:5px solid ${BRAND.privacyRed};border-radius:6px;padding:16px 20px">
        <p style="margin:0 0 8px;font-weight:700;color:${BRAND.privacyRed};font-size:0.95rem">
          &#9888;&#65039; Privacy &amp; Compliance Risk Identified
        </p>
        <p style="margin:0 0 12px;color:${BRAND.textDark};font-size:0.88rem;line-height:1.6">${esc(answer)}</p>
        <p style="margin:0;font-size:0.82rem;color:${BRAND.privacyAmb};font-weight:600">
          Action required: This project must be reviewed by your Data Protection / Compliance team before proceeding.
        </p>
      </div>`;
    return sectionCard("privacy", "Privacy &amp; Compliance Flag", "🔒", content);
  }

  const content = `
    <div style="background:${BRAND.successBg};border-left:5px solid ${BRAND.successGrn};border-radius:6px;padding:16px 20px">
      <p style="margin:0 0 6px;font-weight:700;color:${BRAND.successGrn};font-size:0.88rem">No Privacy Concerns Flagged</p>
      <p style="margin:0;color:${BRAND.textDark};font-size:0.88rem;line-height:1.6">${esc(answer)}</p>
    </div>`;
  return sectionCard("privacy", "Privacy &amp; Compliance Flag", "🔒", content);
}

function buildSuggestedSolution(session) {
  const path   = session.solution_path   ?? "Not determined";
  const reason = session.solution_reason ?? "No reasoning recorded.";

  const content = `
    <div style="margin-bottom:16px">
      <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:${BRAND.textMid}">Recommended Path</span>
      <div style="margin-top:8px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.5rem;font-weight:800;color:${BRAND.navy}">${esc(path)}</span>
      </div>
    </div>
    <div style="background:${BRAND.lightBlue};border-radius:8px;padding:16px 20px">
      <p style="margin:0;font-size:0.88rem;color:${BRAND.textDark};line-height:1.7"><strong>Why this path:</strong> ${esc(reason)}</p>
    </div>`;
  return sectionCard("solution", "Suggested Solution", "🧭", content);
}

function buildBacklog(session) {
  const items = session.backlog ?? [];

  if (items.length === 0) {
    const content = `<p style="color:${BRAND.textMid};font-size:0.88rem;margin:0">No backlog items recorded.</p>`;
    return sectionCard("backlog", "Proposed Backlog", "📝", content);
  }

  const PRIORITY_COLOR = { High: "#C0392B", Medium: BRAND.privacyAmb, Low: BRAND.successGrn };

  const rows = items.map((item, i) => {
    const pColor = PRIORITY_COLOR[item.priority] ?? BRAND.blue;
    return `
      <tr style="border-bottom:1px solid ${BRAND.border}">
        <td style="padding:12px 8px;font-size:0.82rem;font-weight:700;color:${BRAND.textMid};vertical-align:top;white-space:nowrap">#${i + 1}</td>
        <td style="padding:12px 8px;vertical-align:top">
          <span style="display:inline-block;margin-bottom:4px;font-weight:600;color:${BRAND.textDark};font-size:0.88rem">${esc(item.task)}</span><br>
          <span style="font-size:0.8rem;color:${BRAND.textMid}">${esc(item.rationale)}</span>
        </td>
        <td style="padding:12px 8px;vertical-align:top;white-space:nowrap">${pill(item.priority ?? "–", pColor)}</td>
      </tr>`;
  }).join("");

  const content = `
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="border-bottom:2px solid ${BRAND.border}">
          <th style="padding:8px;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:.05em;color:${BRAND.textMid}">#</th>
          <th style="padding:8px;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:.05em;color:${BRAND.textMid}">Task &amp; Rationale</th>
          <th style="padding:8px;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:.05em;color:${BRAND.textMid}">Priority</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
  return sectionCard("backlog", "Proposed Backlog", "📝", content);
}

function buildSkillSuggestions(session) {
  const items = session.skill_suggestions ?? [];

  if (items.length === 0) {
    const content = `<p style="color:${BRAND.textMid};font-size:0.88rem;margin:0">No skill suggestions recorded.</p>`;
    return sectionCard("skills", "Skill-Match Suggestions", "🧑‍💻", content);
  }

  const cards = items.map((item) => `
    <div style="border:1px solid ${BRAND.border};border-radius:8px;padding:16px 20px;background:${BRAND.bodyBg}">
      <p style="margin:0 0 8px;font-weight:700;color:${BRAND.navy};font-size:0.9rem">${esc(item.role)}</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
        ${(item.skills ?? []).map((s) => pill(s)).join("")}
      </div>
      ${item.rationale ? `<p style="margin:0;font-size:0.8rem;color:${BRAND.textMid};line-height:1.5">${esc(item.rationale)}</p>` : ""}
    </div>`).join("");

  const content = `
    <p style="margin:0 0 16px;font-size:0.82rem;color:${BRAND.textMid}">
      Note: Skill profiles only — no individual names are referenced in this package.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">${cards}</div>`;
  return sectionCard("skills", "Skill-Match Suggestions", "🧑‍💻", content);
}

function buildPlatformReuse(session) {
  const items = session.platform_reuse ?? [];

  if (items.length === 0) {
    const content = `<p style="color:${BRAND.textMid};font-size:0.88rem;margin:0">No platform reuse opportunities identified.</p>`;
    return sectionCard("reuse", "Platform Reuse Analysis", "♻️", content);
  }

  const cards = items.map((item) => `
    <div style="border:1px solid ${BRAND.border};border-radius:8px;padding:16px 20px;background:${BRAND.bodyBg}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <span style="font-weight:700;color:${BRAND.navy};font-size:0.9rem">${esc(item.platform)}</span>
        ${pill("Reuse Opportunity", BRAND.blue)}
      </div>
      <p style="margin:0 0 8px;font-size:0.88rem;color:${BRAND.textDark};line-height:1.6">${esc(item.opportunity)}</p>
      ${item.evidence ? `<p style="margin:0;font-size:0.79rem;color:${BRAND.textMid};font-style:italic">Evidence: ${esc(item.evidence)}</p>` : ""}
    </div>`).join("");

  const content = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">${cards}</div>`;
  return sectionCard("reuse", "Platform Reuse Analysis", "♻️", content);
}

function buildGateStatus(session) {
  const gateRow = (label, approved, note) => {
    const color = approved ? BRAND.successGrn : BRAND.privacyAmb;
    const icon  = approved ? "✅" : "⏳";
    return `
      <div style="display:flex;align-items:flex-start;gap:14px;padding:12px 0;border-bottom:1px solid ${BRAND.border}">
        <span style="font-size:1.2rem;flex-shrink:0">${icon}</span>
        <div>
          <strong style="color:${color};font-size:0.88rem">${esc(label)}</strong>
          ${note ? `<p style="margin:4px 0 0;font-size:0.82rem;color:${BRAND.textMid}">${esc(note)}</p>` : ""}
        </div>
      </div>`;
  };

  const content = `
    ${gateRow("Gate A — Business AI Leader &amp; AI Group Leader sign-off", session.gate_a_approved, session.gate_a_approved ? "Both approvers have reviewed and approved the project outline." : "Pending approval.")}
    ${gateRow("Gate B — Budget confirmation", session.gate_b_approved, session.gate_b_approved ? "Budget confirmed. Gate B cleared automatically." : "Budget not yet confirmed. See Case for Management below.")}
    ${!session.gate_b_approved && session.case_for_management ? `
      <div style="margin-top:16px;background:${BRAND.lightBlue};border-radius:8px;padding:18px 22px">
        <p style="margin:0 0 8px;font-weight:700;color:${BRAND.navy};font-size:0.88rem">Case for Management</p>
        <p style="margin:0;font-size:0.87rem;color:${BRAND.textDark};white-space:pre-line;line-height:1.7">${esc(session.case_for_management)}</p>
      </div>` : ""}`;
  return sectionCard("gates", "Governance Gates", "🏛️", content);
}

// ── TOC ───────────────────────────────────────

function buildTOC() {
  const links = [
    ["conversation-notes", "Conversation Notes"],
    ["privacy",            "Privacy & Compliance Flag"],
    ["solution",           "Suggested Solution"],
    ["backlog",            "Proposed Backlog"],
    ["skills",             "Skill-Match Suggestions"],
    ["reuse",              "Platform Reuse Analysis"],
    ["gates",              "Governance Gates"],
  ];
  const items = links.map(([id, label]) =>
    `<li style="margin-bottom:4px"><a href="#${id}" style="color:${BRAND.blue};text-decoration:none;font-size:0.85rem">${esc(label)}</a></li>`
  ).join("");
  return `
  <nav style="background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:10px;padding:18px 24px;margin-bottom:24px">
    <p style="margin:0 0 10px;font-weight:700;font-size:0.8rem;text-transform:uppercase;letter-spacing:.06em;color:${BRAND.textMid}">Contents</p>
    <ol style="margin:0;padding-left:18px">${items}</ol>
  </nav>`;
}

// ── Main export ───────────────────────────────

/**
 * Generates a self-contained Pathfinder Decision Package as an HTML string.
 *
 * @param {Session} session
 * @returns {string} Full HTML document
 */
export function generatePackage(session) {
  const title       = session.project_title ?? "Pathfinder Decision Package";
  const generatedAt = formatDate(session.generated_at ?? new Date().toISOString());

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: ${BRAND.bodyBg};
      color: ${BRAND.textDark};
      -webkit-font-smoothing: antialiased;
    }
    a { color: ${BRAND.blue}; }
    @media print {
      body { background: white; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <header style="background:${BRAND.navy};color:${BRAND.white};padding:0;margin-bottom:0">
    <div style="max-width:900px;margin:0 auto;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${BRAND.lightBlue};margin-bottom:6px">Pathfinder</div>
        <h1 style="margin:0;font-size:1.45rem;font-weight:800;line-height:1.2">${esc(title)}</h1>
        <p style="margin:8px 0 0;font-size:0.8rem;color:${BRAND.lightBlue}">Decision Package &mdash; Generated ${esc(generatedAt)}</p>
      </div>
      <div style="text-align:right">
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end">
          ${session.gate_a_approved ? pill("Gate A ✓", BRAND.lightBlue) : ""}
          ${session.gate_b_approved ? pill("Gate B ✓", BRAND.lightBlue) : ""}
          ${session.solution_path   ? pill(session.solution_path, BRAND.lightBlue) : ""}
        </div>
      </div>
    </div>
  </header>

  <!-- Body -->
  <main style="max-width:900px;margin:0 auto;padding:32px">
    ${buildDisclaimer()}
    ${buildTOC()}
    ${buildConversationNotes(session)}
    ${buildPrivacyFlag(session)}
    ${buildSuggestedSolution(session)}
    ${buildBacklog(session)}
    ${buildSkillSuggestions(session)}
    ${buildPlatformReuse(session)}
    ${buildGateStatus(session)}
  </main>

  <!-- Footer -->
  <footer style="border-top:2px solid ${BRAND.lightBlue};margin-top:16px;padding:20px 32px;max-width:900px;margin-left:auto;margin-right:auto">
    <p style="margin:0;font-size:0.75rem;color:${BRAND.textMid};text-align:center">
      Generated by Pathfinder &bull; ${esc(generatedAt)} &bull; Human review required before any decisions are made.
    </p>
  </footer>

</body>
</html>`;

  return html;
}

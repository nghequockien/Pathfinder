// ─────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────

export const SYSTEM_PROMPT = `
You are Pathfinder, an intelligent discovery partner for business users exploring AI solutions.
You guide users through exactly 5 phases, in order. You are warm, clear, and non-technical in tone.

━━━ GLOBAL RULES (always enforced) ━━━
- Never skip Question 4 (privacy). It is MANDATORY in every session.
- Never name individual engineers. Refer to skill profiles only (e.g. "a data engineer", "an AI specialist").
- Every recommendation must include a plain-English reason — no jargon without explanation.
- Maintain a warm, encouraging, non-technical tone throughout.
- You are non-deterministic: you may explore different paths, but the Human-in-the-Loop rule always applies — no action is taken without user confirmation.
- Track all state provided in the [AGENT STATE] block and update it faithfully in your response as JSON inside a <state> tag.

━━━ PHASE 1 — Smart Apprentice Introduction ━━━
Introduce yourself as Pathfinder, a "Smart Apprentice". Explain:
  - You are non-deterministic (you explore possibilities, not fixed answers).
  - The Human-in-the-Loop rule: nothing is finalised without the user's sign-off.
Then ask: "Have you submitted a project like this before?"
  - If YES → switch to Fast Track mode: ask the user to describe their project in full, all at once.
  - If NO  → switch to Guided mode: proceed through Phase 2 questions one at a time.
Transition to Phase 2 once mode is confirmed and initial information is received.

━━━ PHASE 2 — Discovery Questions ━━━
In GUIDED mode, ask questions ONE AT A TIME, in this exact order.
Each question must include a brief "Why I'm asking:" explanation beneath it.

Q1 — Goal
  "What outcome should the AI achieve for your team or organisation?"
  Why I'm asking: This defines the core purpose and helps me match the right type of AI solution to your need.

Q2 — Users
  "Who will use this, and roughly how often?"
  Why I'm asking: Usage patterns affect how the system should be built and how much it needs to scale.

Q3 — Data
  "Where does the information this AI would use live today? (e.g. documents, databases, spreadsheets, emails)"
  Why I'm asking: The location and format of your data shapes which technical approach will work best.

Q4 — Privacy (MANDATORY — never skip)
  "Does this project touch any personal data, confidential information, or regulated content (e.g. health records, financial data, HR files)?"
  Why I'm asking: Privacy and compliance requirements must be identified early — they shape the entire solution and may affect which tools we can use.

Q5 — Integration
  "Does this need to connect to any existing systems, tools, or platforms your team already uses?"
  Why I'm asking: Integrations can affect complexity and timeline, so it's important to know what needs to talk to what.

Q6 — Budget
  "Is there a confirmed budget for this project, even a rough range?"
  Why I'm asking: Budget visibility helps me tailor recommendations and determines whether additional sign-off steps are needed later.

After all 6 answers are collected (or after a Fast Track description), internally evaluate and select one solution path:
  - RAG Pipeline: best when the use case is primarily about finding or summarising information from existing documents/data.
  - AI Agent: best when the AI needs to take actions, make decisions across steps, or interact with multiple systems.
  - LLM + Template: best when the output is structured and consistent (reports, emails, summaries) and data is straightforward.

Then tell the user which path you selected and explain why in plain English.

In FAST TRACK mode, extract the answers to all 6 questions from the user's description (infer where needed, ask for clarification only if privacy information is completely absent), then proceed to solution path selection.

━━━ PHASE 3 — User Stories ━━━
Draft User Stories in this exact format:
  "As a [User], I want [Ability], so that [Value]."

For each story:
  - Ask the user for Acceptance Criteria (what does "done" look like for this story?).
  - Run at least 2 rounds of refinement before offering to proceed.
  - After each round, summarise what changed and why.
  - Maintain a version history: label each version (v1, v2, v3…) and note what was updated.

Do not move to Phase 4 until at least 2 refinement rounds are complete and the user confirms they are happy.

━━━ PHASE 4 — Governance Gates ━━━
Gate A:
  Inform the user: "I've sent a sign-off notification to the Business AI Leader and the AI Group Leader."
  Simulate their review and approval: "Both have reviewed the project outline and given their approval. Gate A is cleared."

Gate B (Budget Check):
  - If budget was confirmed in Q6: "Budget is confirmed. Gate B is cleared automatically."
  - If budget was NOT confirmed: Generate a short "Case for Management" summary including:
      • The business problem being solved
      • The recommended solution path and why
      • Expected value / benefit in plain English
      • A request for budget approval
    Tell the user: "A Case for Management has been prepared. Please share this with the relevant budget holder for approval before proceeding."

━━━ PHASE 5 — Decision Package ━━━
Tell the user: "Your Decision Package is ready. It includes your discovery answers, user stories, solution recommendation, and governance approvals."
Indicate that a Download button will appear in the interface.
Offer a brief, friendly summary of the journey and next steps.

━━━ STATE MANAGEMENT ━━━
At the end of every response, output your updated agent state as JSON inside <state></state> tags.
The state object must include:
{
  "phase": 1–5,
  "mode": null | "guided" | "fast-track",
  "questionIndex": 0–6,
  "answers": {
    "goal": null | string,
    "users": null | string,
    "data": null | string,
    "privacy": null | string,
    "integration": null | string,
    "budget": null | string
  },
  "budgetConfirmed": boolean,
  "solutionPath": null | "RAG Pipeline" | "AI Agent" | "LLM+Template",
  "solutionReason": null | string,
  "userStories": [],
  "storyVersionHistory": [],
  "refinementRounds": 0,
  "gateAApproved": boolean,
  "gateBApproved": boolean,
  "decisionPackageReady": boolean
}
`.trim();

// ─────────────────────────────────────────────
// PHASE MANAGER
// ─────────────────────────────────────────────

export const PHASE_LABELS = {
  1: "Smart Apprentice Introduction",
  2: "Discovery Questions",
  3: "User Stories",
  4: "Governance Gates",
  5: "Decision Package",
};

export const SOLUTION_PATHS = {
  RAG: "RAG Pipeline",
  AGENT: "AI Agent",
  LLM_TEMPLATE: "LLM+Template",
};

export const QUESTIONS = [
  { key: "goal", label: "Goal" },
  { key: "users", label: "Users" },
  { key: "data", label: "Data" },
  { key: "privacy", label: "Privacy" }, // index 3 — MANDATORY
  { key: "integration", label: "Integration" },
  { key: "budget", label: "Budget" },
];

/** Returns a fresh, empty agent state. */
export function createInitialState() {
  return {
    phase: 1,
    mode: null,
    questionIndex: 0,
    answers: {
      goal: null,
      users: null,
      data: null,
      privacy: null,
      integration: null,
      budget: null,
    },
    budgetConfirmed: false,
    solutionPath: null,
    solutionReason: null,
    userStories: [],
    storyVersionHistory: [],
    refinementRounds: 0,
    gateAApproved: false,
    gateBApproved: false,
    decisionPackageReady: false,
  };
}

/**
 * Parses the <state>…</state> block from a model response.
 * Returns the parsed state object, or null if not found / invalid.
 */
export function parseStateFromResponse(responseText) {
  const match = responseText.match(/<state>([\s\S]*?)<\/state>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch {
    return null;
  }
}

/**
 * Strips the <state>…</state> block from a model response so it is
 * never shown to the user in the chat bubble.
 */
export function stripStateBlock(responseText) {
  return responseText.replace(/<state>[\s\S]*?<\/state>/, "").trim();
}

/**
 * Validates that a state object contains all required keys and that
 * Q4 (privacy) has not been skipped when Phase 2 is complete.
 */
export function validateState(state) {
  if (!state || typeof state !== "object") return false;
  if (state.phase >= 3 && state.answers.privacy === null) {
    console.warn(
      "Pathfinder: privacy answer is missing — Q4 must not be skipped.",
    );
    return false;
  }
  return true;
}

/**
 * Returns a summary of the current phase for display in the UI.
 */
export function getPhaseSummary(state) {
  return {
    currentPhase: state.phase,
    phaseLabel: PHASE_LABELS[state.phase] ?? "Unknown",
    mode: state.mode,
    questionsAnswered: Object.values(state.answers).filter(Boolean).length,
    totalQuestions: QUESTIONS.length,
    solutionPath: state.solutionPath,
    refinementRounds: state.refinementRounds,
    gateAApproved: state.gateAApproved,
    gateBApproved: state.gateBApproved,
    packageReady: state.decisionPackageReady,
  };
}

// ─────────────────────────────────────────────
// LLM PROVIDER RUNNER
// ─────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL_BY_PROVIDER = {
  anthropic: "claude-sonnet-4-6",
  openai: "gpt-4.1-mini",
  "azure-openai": "",
  gemini: "gemini-2.0-flash",
};

const REQUIRED_ENV_BY_PROVIDER = {
  anthropic: ["ANTHROPIC_API_KEY"],
  openai: ["OPENAI_API_KEY"],
  "azure-openai": [
    "AZURE_OPENAI_ENDPOINT",
    "AZURE_OPENAI_DEPLOYMENT",
    "AZURE_OPENAI_API_KEY",
  ],
  gemini: ["GEMINI_API_KEY"],
};

function normalizeProvider(rawProvider) {
  const provider = String(
    rawProvider ?? process.env.LLM_PROVIDER ?? "anthropic",
  )
    .trim()
    .toLowerCase();

  if (["azure", "azureopenai", "azure_openai"].includes(provider)) {
    return "azure-openai";
  }

  return provider;
}

function buildSystemContext(agentState) {
  return agentState
    ? `\n\n[AGENT STATE]\n${JSON.stringify(agentState, null, 2)}\n[/AGENT STATE]`
    : "";
}

function normalizeMessages(messages) {
  return messages.map((m) => ({
    role: m.role,
    content: String(m.content ?? ""),
  }));
}

function ensureEnv(varName, providerName) {
  const value = process.env[varName];
  if (!value) {
    throw new Error(
      `Missing required env var ${varName} for provider ${providerName}.`,
    );
  }
  return value;
}

function getMissingEnvVars(provider) {
  const requiredVars = REQUIRED_ENV_BY_PROVIDER[provider] ?? [];
  return requiredVars.filter((varName) => !process.env[varName]);
}

function assertProviderEnvConfigured(provider) {
  if (!REQUIRED_ENV_BY_PROVIDER[provider]) {
    throw new Error(
      `Unsupported LLM provider: ${provider}. Use anthropic, openai, azure-openai, or gemini.`,
    );
  }

  const missingVars = getMissingEnvVars(provider);
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables for provider ${provider}: ${missingVars.join(", ")}.`,
    );
  }
}

async function runAnthropic(messages, systemPrompt) {
  const client = new Anthropic({
    apiKey: ensureEnv("ANTHROPIC_API_KEY", "anthropic"),
  });

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL_BY_PROVIDER.anthropic,
    max_tokens: 2048,
    system: systemPrompt,
    messages: normalizeMessages(messages),
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

async function runOpenAI(messages, systemPrompt) {
  const apiKey = ensureEnv("OPENAI_API_KEY", "openai");
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL_BY_PROVIDER.openai;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        ...normalizeMessages(messages),
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

async function runAzureOpenAI(messages, systemPrompt) {
  const endpoint = ensureEnv("AZURE_OPENAI_ENDPOINT", "azure-openai").replace(
    /\/$/,
    "",
  );
  const deployment = ensureEnv("AZURE_OPENAI_DEPLOYMENT", "azure-openai");
  const apiKey = ensureEnv("AZURE_OPENAI_API_KEY", "azure-openai");
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      max_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        ...normalizeMessages(messages),
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Azure OpenAI request failed (${response.status}): ${errorBody}`,
    );
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

function toGeminiRole(role) {
  return role === "assistant" ? "model" : "user";
}

async function runGemini(messages, systemPrompt) {
  const apiKey = ensureEnv("GEMINI_API_KEY", "gemini");
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL_BY_PROVIDER.gemini;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        maxOutputTokens: 2048,
      },
      contents: normalizeMessages(messages).map((m) => ({
        role: toGeminiRole(m.role),
        parts: [{ text: m.content }],
      })),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text ?? "").join("");
}

async function callProvider(provider, messages, systemPrompt) {
  switch (provider) {
    case "anthropic":
      return runAnthropic(messages, systemPrompt);
    case "openai":
      return runOpenAI(messages, systemPrompt);
    case "azure-openai":
      return runAzureOpenAI(messages, systemPrompt);
    case "gemini":
      return runGemini(messages, systemPrompt);
    default:
      throw new Error(
        `Unsupported LLM provider: ${provider}. Use anthropic, openai, azure-openai, or gemini.`,
      );
  }
}

/**
 * Sends the conversation to the configured provider with the Pathfinder system prompt.
 * Injects the current agentState as a system context block so the model
 * always knows exactly where it is in the session.
 *
 * @param {Array}  messages    - Full conversation history [{role, content}]
 * @param {Object} agentState  - Current phase manager state
 * @returns {{ reply: string }}
 */
export async function runPathfinderAgent(messages, agentState) {
  const provider = normalizeProvider();
  assertProviderEnvConfigured(provider);
  const systemContext = buildSystemContext(agentState);
  const systemPrompt = SYSTEM_PROMPT + systemContext;
  const reply = await callProvider(provider, messages, systemPrompt);

  return { reply };
}

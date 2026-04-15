# Pathfinder

An AI-powered discovery partner that guides business users through scoping an AI project — from first conversation to a downloadable Decision Package — without requiring any technical knowledge.

Built with Next.js 14 (App Router), Tailwind CSS, and pluggable LLM providers:

- Anthropic
- OpenAI
- Azure OpenAI
- Gemini

---

## Prerequisites

- Node.js 18 or higher
- API credentials for at least one supported provider

---

## Setup

1. **Copy the project files** into a local directory (or clone the repository).

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure your provider:**
   Copy `.env.local.example` to `.env.local`, set `LLM_PROVIDER`, and fill in credentials for that provider.

Example using Anthropic:

```
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Example using OpenAI:

```
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```

Example using Azure OpenAI:

```
LLM_PROVIDER=azure-openai
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_API_VERSION=2024-10-21
```

Example using Gemini:

```
LLM_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash
```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Pathfinder will greet you automatically.

---

## The 5 Phases

### Phase 1 — Smart Apprentice Introduction

Pathfinder introduces itself and explains two ground rules: it is non-deterministic (it explores possibilities rather than giving fixed answers), and a Human-in-the-Loop rule applies (nothing is finalised without your sign-off). It then asks whether you have submitted a project like this before. If yes, you enter **Fast Track mode** and describe your project all at once. If no, you enter **Guided mode** and answer questions one at a time.

### Phase 2 — Discovery Questions

Six questions are asked in order — Goal, Users, Data, Privacy, Integration, and Budget. Each question comes with a plain-English explanation of why it matters. The Privacy question is mandatory and can never be skipped. Once all six answers are collected, Pathfinder selects one of three solution paths — **RAG Pipeline**, **AI Agent**, or **LLM + Template** — and explains the choice in plain language.

### Phase 3 — User Stories

Pathfinder drafts User Stories in the format _"As a [User], I want [Ability], so that [Value]."_ For each story, it asks you for Acceptance Criteria. At least two rounds of refinement are run before you can move on, with a version history kept for every change. Nothing proceeds until you confirm you are happy with the stories.

### Phase 4 — Governance Gates

Two sign-off gates are simulated. **Gate A** notifies the Business AI Leader and AI Group Leader and simulates their approval. **Gate B** checks whether a budget was confirmed during Phase 2 — if it was, the gate clears automatically; if not, Pathfinder generates a plain-English Case for Management summary ready to share with a budget holder.

### Phase 5 — Decision Package

The session is complete. A **Download Decision Package** button appears in the top bar. Clicking it generates a self-contained, professionally styled HTML file containing: a plain-language summary of your business requirements, the privacy and compliance assessment, the recommended solution with reasoning, a prioritised task backlog, required skill profiles, and any platform reuse opportunities. A disclaimer banner reminds readers that all decisions remain with the human expert team.

---

## Project Structure

```
app/
  page.js               — Main page; owns all conversation and agent state
  layout.js             — Root layout with Tailwind globals
  globals.css           — Tailwind base styles
  api/chat/route.js     — POST endpoint; forwards messages to the configured provider

components/
  Sidebar.jsx           — Fixed left sidebar with phase progress and privacy indicator
  ChatWindow.jsx        — Message list, typing indicator, input bar, download button
  MessageBubble.jsx     — Individual chat bubble with bold markdown support

lib/
  pathfinder-agent.js   — System prompt, phase manager, state helpers, provider-agnostic LLM runner
  generate-package.js   — Generates the self-contained HTML Decision Package
```

---

## Key Design Decisions

- **State lives in `app/page.js`** — `agentState` (phase, answers, flags) is owned at the top level and passed down, keeping components stateless and predictable.
- **The model manages its own phase state** — At the end of every reply, the configured provider emits a `<state>` JSON block. The client parses it, stores it, and sends it back with the next request so the API route stays stateless.
- **No engineer names, ever** — The system prompt enforces skill-profile-only references. The Decision Package reinforces this with an explicit note in the Skill-Match section.
- **Privacy is mandatory** — `Q4` cannot be skipped by the model (enforced in the prompt) and is independently validated in `validateState()` before Phase 3 is allowed to begin.
- **Provider credentials are server-only** — API keys are read exclusively in `lib/pathfinder-agent.js` via `process.env` and never sent to the browser.

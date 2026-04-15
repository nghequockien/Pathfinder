import { runPathfinderAgent } from "@/lib/pathfinder-agent";

function getErrorMessage(error) {
  const primary = error?.message
    ? String(error.message)
    : "Unexpected server error.";
  const causeMessage = error?.cause?.message ? String(error.cause.message) : "";
  return causeMessage && causeMessage !== primary
    ? `${primary} Cause: ${causeMessage}`
    : primary;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages, agentState } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Invalid messages format" },
        { status: 400 },
      );
    }

    const result = await runPathfinderAgent(messages, agentState);
    return Response.json(result);
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

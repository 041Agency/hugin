import { ToolDef, AgentFindOptions, LLMCallback } from './types';

const SYSTEM_PROMPT = `You are a tool selector for an AI agent. Pick ONLY the tools directly needed to answer the user's current message — do not preload tools for potential follow-up questions.

Return ONLY a JSON object: {"tools": ["tool1", "tool2"]}. Pick as few tools as possible. For a straightforward data question, 2-4 tools is plenty. Only include more if the request genuinely spans multiple domains.

Example: "how many members" → {"tools": ["query_schema", "query_run"]}
Example: "create a workbook for onboarding" → {"tools": ["workbook_create", "workbook_options", "workbook_teams", "workbook_set_tasks"]}
Example: "show me reports and share the pipeline one" → {"tools": ["report_list", "report_share", "query_schema", "query_run"]}`;

function buildToolCatalog(tools: ToolDef[]): string {
  return tools
    .map((t) => `- ${t.name}: ${t.description}`)
    .join('\n');
}

function buildUserPrompt(tools: ToolDef[], query: string): string {
  return `Available tools:
${buildToolCatalog(tools)}

User's message: "${query}"

Which tools are most relevant? Return as JSON.`;
}

function parseTools(json: string, fallback: ToolDef[]): string[] {
  try {
    const parsed = JSON.parse(json);
    const list = Array.isArray(parsed.tools) ? parsed.tools : parsed;
    if (!Array.isArray(list)) return fallback.map((t) => t.name);
    return [...new Set(list.filter((t: unknown) => typeof t === 'string'))];
  } catch {
    return fallback.map((t) => t.name);
  }
}

export async function findToolsByAgent(
  query: string,
  tools: ToolDef[],
  options: AgentFindOptions,
): Promise<ToolDef[]> {
  const max = options.maxTools ?? 8;
  const { llmCall, model } = options;

  const userPrompt = buildUserPrompt(tools, query);

  const raw = await llmCall(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    model,
  );

  const selectedNames = parseTools(raw, tools);

  const nameSet = new Set(selectedNames);
  const matched = tools.filter((t) => nameSet.has(t.name));

  return matched.slice(0, max);
}

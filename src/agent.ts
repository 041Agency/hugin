import { ToolDef, AgentFindOptions, LLMCallback } from './types';

const SYSTEM_PROMPT = `You are a tool selector for an AI agent. Your job is to pick the most relevant tools for the user's request.

You will receive:
1. A catalog of available tools, each with a name and one-line description
2. The user's message

Return ONLY a JSON object with one field: "tools" — an array of tool names that are most relevant to the user's request. Pick 3-8 tools. Include tools the user is likely to need based on their intent. Do NOT include tools that are clearly unrelated.

Example response:
{"tools": ["workbook_list", "workbook_create", "query_run", "query_schema"]}`;

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

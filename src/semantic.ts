import { ToolDef, FindToolOptions } from './types';

function tokenize(text: string): Set<string> {
  const tokens = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
  return new Set(tokens);
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function toolTokens(tool: ToolDef): Set<string> {
  return tokenize(`${tool.name} ${tool.description}`);
}

export function findToolsBySemantic(
  query: string,
  tools: ToolDef[],
  options: FindToolOptions = {},
): ToolDef[] {
  const max = options.maxTools ?? 8;
  const queryTokens = tokenize(query);

  const scored = tools.map((tool) => ({
    tool,
    score: jaccardSimilarity(queryTokens, toolTokens(tool)),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, max).map((s) => s.tool);
}

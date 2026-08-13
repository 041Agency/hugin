import { ToolDef, FindToolOptions, AgentFindOptions, ToolStrategy } from './types';
import { findToolsBySemantic } from './semantic';
import { findToolsByAgent } from './agent';

export { ToolDef, FindToolOptions, AgentFindOptions, ToolStrategy, LLMCallback, LLMMessage } from './types';
export { findToolsBySemantic } from './semantic';
export { findToolsByAgent } from './agent';

export async function findTools(
  query: string,
  tools: ToolDef[],
  strategy: ToolStrategy,
  options: FindToolOptions | AgentFindOptions = {},
): Promise<ToolDef[]> {
  if (!tools.length) return [];
  if (tools.length <= (options.maxTools ?? 8)) return tools;

  switch (strategy) {
    case 'semantic':
      return findToolsBySemantic(query, tools, options as FindToolOptions);
    case 'agent':
      return findToolsByAgent(query, tools, options as AgentFindOptions);
    default:
      return tools;
  }
}

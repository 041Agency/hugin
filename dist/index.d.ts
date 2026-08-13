import { ToolDef, FindToolOptions, AgentFindOptions, ToolStrategy } from './types';
export { ToolDef, FindToolOptions, AgentFindOptions, ToolStrategy, LLMCallback, LLMMessage } from './types';
export { findToolsBySemantic } from './semantic';
export { findToolsByAgent } from './agent';
export declare function findTools(query: string, tools: ToolDef[], strategy: ToolStrategy, options?: FindToolOptions | AgentFindOptions): Promise<ToolDef[]>;
//# sourceMappingURL=index.d.ts.map
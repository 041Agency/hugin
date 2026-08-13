export interface ToolDef {
    name: string;
    description: string;
}
export interface FindToolOptions {
    maxTools?: number;
}
export type LLMCallback = (messages: LLMMessage[], model: string) => Promise<string>;
export interface LLMMessage {
    role: 'system' | 'user';
    content: string;
}
export type ToolStrategy = 'semantic' | 'agent';
export interface AgentFindOptions extends FindToolOptions {
    llmCall: LLMCallback;
    model: string;
}
//# sourceMappingURL=types.d.ts.map
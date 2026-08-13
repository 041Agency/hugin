# Hugin

Progressive tool disclosure for LLM agents :  selects only the most relevant tools from a large catalog before each request, instead of sending all tools every time. Two strategies: semantic matching (zero cost, zero deps) and agent-based selection (one extra LLM call, smarter).

Named after Odin's raven of thought, who scouts ahead and returns with what matters.

## Install

```bash
npm install @fundr/hugin
```

## Usage

```ts
import { findTools, ToolDef, LLMCallback } from '@fundr/hugin';

const allTools: ToolDef[] = [
  { name: 'search_docs',    description: 'Search documentation by keyword' },
  { name: 'create_ticket',  description: 'Create a Jira ticket' },
  { name: 'deploy_service', description: 'Deploy a service to production' },
  { name: 'run_query',      description: 'Run a SQL query against the warehouse' },
  { name: 'get_weather',    description: 'Get current weather for a city' },
  { name: 'send_email',     description: 'Send an email to a recipient' },
  // ... 50 more tools
];
```

### Semantic strategy (zero cost)

Pure token-overlap matching. No API calls, no dependencies.

```ts
const tools = await findTools(userMessage, allTools, 'semantic', {
  maxTools: 5,
});
```

### Agent strategy (one extra LLM call)

A lightweight LLM call picks the tools. You provide the LLM bridge :  Hugin never touches an API key.

```ts
const llmCall: LLMCallback = async (messages, model) => {
  // OpenAI example (works with Anthropic, OpenCode, any provider):
  const res = await openai.chat.completions.create({
    model,
    max_tokens: 256,
    messages,
  });
  return res.choices[0].message.content ?? '';
};

const tools = await findTools(userMessage, allTools, 'agent', {
  maxTools: 5,
  llmCall,
  model: 'deepseek-v4-pro',
});
```

After selection, send only those tools to your main agent:

```ts
const reply = await mainAgent.create({
  model: 'deepseek-v4-pro',
  messages: [{ role: 'user', content: userMessage }],
  tools, // 5 tools, not 56
});
```

## API

### `findTools(query, tools, strategy, options?)`

| Param | Type | Description |
|-------|------|-------------|
| `query` | `string` | The user's message |
| `tools` | `ToolDef[]` | Full tool catalog (name + description) |
| `strategy` | `'semantic'` \| `'agent'` | Selection strategy |
| `options.maxTools` | `number` | Max tools to return (default 8) |
| `options.llmCall` | `LLMCallback` | Required for `'agent'` strategy |
| `options.model` | `string` | Required for `'agent'` strategy |

Returns `Promise<ToolDef[]>` :  the selected subset of tools.

### `ToolDef`

```ts
interface ToolDef {
  name: string;
  description: string;
}
```

### `LLMCallback`

```ts
type LLMCallback = (
  messages: { role: 'system' | 'user'; content: string }[],
  model: string,
) => Promise<string>;
```

## Strategies

### Semantic matching

Tokenizes tool names, descriptions, and the user's query. Computes Jaccard similarity scores. Returns the top N. Deterministic, sub-millisecond, zero runtime dependencies.

Best for tool catalogs with distinct, descriptive names and domain-specific vocabulary.

### Agent-based selection

Sends a compact tool catalog (names + one-line descriptions) and the user's query to an LLM via your callback. The model returns a JSON array of relevant tool names. One extra LLM call per turn, but understands user intent beyond keyword overlap.

Best for catalogs with overlapping or abstract tool names, or when users phrase requests indirectly.

## Design

- **No API keys.** Hugin never makes API calls or holds credentials. The `LLMCallback` is your bridge.
- **Zero runtime dependencies** (semantic strategy). Only TypeScript as a dev dependency.
- **Small.** The semantic strategy is ~40 lines of JS.
- **Provider-agnostic.** The `LLMCallback` pattern works with any LLM SDK.

## License

MIT

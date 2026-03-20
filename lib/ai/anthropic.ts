const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "anthropic/claude-sonnet-4-20250514";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ToolDef {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface ChatResponse {
  text: string;
  toolCalls: { name: string; arguments: Record<string, unknown> }[];
}

export async function chatCompletion(opts: {
  system: string;
  messages: { role: string; content: string }[];
  tools?: ToolDef[];
  maxTokens?: number;
}): Promise<ChatResponse> {
  const messages: Message[] = [
    { role: "system", content: opts.system },
    ...opts.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    max_tokens: opts.maxTokens || 1024,
  };

  if (opts.tools && opts.tools.length > 0) {
    body.tools = opts.tools;
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];

  const text = choice?.message?.content || "";
  const toolCalls = (choice?.message?.tool_calls || []).map(
    (tc: { function: { name: string; arguments: string } }) => ({
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    })
  );

  return { text, toolCalls };
}

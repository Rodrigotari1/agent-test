export interface ToolCall {
  name: string;
  args?: Record<string, unknown>;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface AgentResult {
  output: string;
  toolCalls: ToolCall[];
  tokens?: TokenUsage;
  durationMs?: number;
}

export interface ExecutionTrace {
  prompt: string;
  result: AgentResult;
  startTime: number;
  endTime: number;
  durationMs: number;
}

export type AgentFunction = (prompt: string) => Promise<AgentResult>;

export interface TestCase {
  name: string;
  fn: () => Promise<void>;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: Error;
  durationMs?: number;
  tokens?: TokenUsage;
}

export interface Assertion {
  toCallTool(toolName: string): void;
  toMention(text: string): void;
  toCallToolWith(toolName: string, expectedArgs: Record<string, unknown>): void;
  toCallToolTimes(toolName: string, options: { min?: number; max?: number; exactly?: number }): void;
  toRespondIn(options: { ms: number }): void;
  toSatisfy(condition: (result: AgentResult) => boolean, message?: string): void;
  not: {
    toCallTool(toolName: string): void;
    toMention(text: string): void;
  };
}

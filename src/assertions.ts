import { AgentResult, Assertion } from './types';

class NegatedAssertion {
  constructor(private result: AgentResult) {}

  toCallTool(toolName: string): void {
    const called = this.result.toolCalls.some(call => call.name === toolName);
    if (called) {
      throw new Error(`Expected agent not to call tool "${toolName}"`);
    }
  }

  toMention(text: string): void {
    if (this.result.output.includes(text)) {
      throw new Error(`Expected agent output not to mention "${text}"`);
    }
  }
}

export class AssertionImpl implements Assertion {
  public not: NegatedAssertion;

  constructor(private result: AgentResult) {
    this.not = new NegatedAssertion(result);
  }

  toCallTool(toolName: string): void {
    const called = this.result.toolCalls.some(call => call.name === toolName);
    if (!called) {
      throw new Error(`Expected agent to call tool "${toolName}"`);
    }
  }

  toMention(text: string): void {
    if (!this.result.output.includes(text)) {
      throw new Error(`Expected agent output to mention "${text}"`);
    }
  }

  toCallToolWith(toolName: string, expectedArgs: Record<string, unknown>): void {
    const call = this.result.toolCalls.find(c => c.name === toolName);
    if (!call) {
      throw new Error(`Expected agent to call tool "${toolName}"`);
    }

    const actualArgs = call.args || {};
    for (const [key, value] of Object.entries(expectedArgs)) {
      if (actualArgs[key] !== value) {
        throw new Error(
          `Expected tool "${toolName}" to be called with ${key}="${value}", got "${actualArgs[key]}"`
        );
      }
    }
  }

  toCallToolTimes(toolName: string, options: { min?: number; max?: number; exactly?: number }): void {
    const count = this.result.toolCalls.filter(c => c.name === toolName).length;

    if (options.exactly !== undefined && count !== options.exactly) {
      throw new Error(`Expected tool "${toolName}" to be called exactly ${options.exactly} times, got ${count}`);
    }

    if (options.min !== undefined && count < options.min) {
      throw new Error(`Expected tool "${toolName}" to be called at least ${options.min} times, got ${count}`);
    }

    if (options.max !== undefined && count > options.max) {
      throw new Error(`Expected tool "${toolName}" to be called at most ${options.max} times, got ${count}`);
    }
  }

  toRespondIn(options: { ms: number }): void {
    const duration = this.result.durationMs || 0;
    if (duration > options.ms) {
      throw new Error(`Expected agent to respond in ${options.ms}ms, took ${duration}ms`);
    }
  }

  toSatisfy(condition: (result: AgentResult) => boolean, message?: string): void {
    if (!condition(this.result)) {
      throw new Error(message || 'Expected agent result to satisfy condition');
    }
  }
}

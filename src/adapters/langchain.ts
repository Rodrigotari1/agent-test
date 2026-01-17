import { AgentFunction, AgentResult, ToolCall } from '../types';

interface LangChainAgentExecutor {
  invoke(input: { input: string }): Promise<LangChainAgentOutput>;
  call?(input: { input: string }): Promise<LangChainAgentOutput>;
}

interface LangChainAgentOutput {
  output: string;
  intermediateSteps?: Array<[{ tool: string; toolInput: any }, any]>;
  llmOutput?: {
    tokenUsage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
  };
}

function extractToolCallsFromSteps(steps: Array<[{ tool: string; toolInput: any }, any]>): ToolCall[] {
  return steps.map(([action]) => ({
    name: action.tool,
    args: action.toolInput
  }));
}

export function wrapLangChainAgent(executor: LangChainAgentExecutor): AgentFunction {
  return async (prompt: string): Promise<AgentResult> => {
    const executeMethod = executor.invoke || executor.call;

    if (!executeMethod) {
      throw new Error('LangChain executor must have invoke() or call() method');
    }

    const langchainResult = await executeMethod.call(executor, { input: prompt });

    const toolCallList = langchainResult.intermediateSteps
      ? extractToolCallsFromSteps(langchainResult.intermediateSteps)
      : [];

    const tokenUsage = langchainResult.llmOutput?.tokenUsage
      ? {
          prompt: langchainResult.llmOutput.tokenUsage.promptTokens || 0,
          completion: langchainResult.llmOutput.tokenUsage.completionTokens || 0,
          total: langchainResult.llmOutput.tokenUsage.totalTokens || 0
        }
      : undefined;

    return {
      output: langchainResult.output,
      toolCalls: toolCallList,
      tokens: tokenUsage
    };
  };
}

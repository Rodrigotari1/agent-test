const { test, runAgent, expect, wrapLangChainAgent } = require('../dist/index');

const mockLangChainExecutor = {
  async invoke({ input }) {
    return {
      output: `Answer about ${input}`,
      intermediateSteps: [
        [{ tool: 'wikipedia', toolInput: { query: input } }, 'Wikipedia result'],
        [{ tool: 'calculator', toolInput: { expression: '2+2' } }, '4']
      ],
      llmOutput: {
        tokenUsage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150
        }
      }
    };
  }
};

const wrappedAgent = wrapLangChainAgent(mockLangChainExecutor);

test('langchain agent extracts tool calls', async () => {
  await runAgent(wrappedAgent, 'What is Python?');

  expect().toCallTool('wikipedia');
  expect().toCallTool('calculator');
  expect().toCallToolTimes('wikipedia', { exactly: 1 });
});

test('langchain agent captures token usage', async () => {
  await runAgent(wrappedAgent, 'Explain AI');

  expect().toSatisfy(
    result => result.tokens?.total === 150,
    'Should track 150 total tokens'
  );
});

test('langchain agent returns output', async () => {
  await runAgent(wrappedAgent, 'machine learning');

  expect().toMention('machine learning');
  expect().toMention('Answer about');
});

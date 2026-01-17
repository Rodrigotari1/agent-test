const { test, runAgent, expect, beforeEach, afterEach } = require('../dist/index');

let testContext = {};

beforeEach(() => {
  testContext = {
    startTime: Date.now(),
    callCount: 0
  };
});

afterEach(() => {
  const duration = Date.now() - testContext.startTime;
  console.log(`  [Context: ${testContext.callCount} calls in ${duration}ms]`);
});

const searchAgent = async (prompt) => {
  testContext.callCount++;

  const searches = prompt.toLowerCase().includes('multiple') ? 2 : 1;
  const toolCalls = [];

  for (let i = 0; i < searches; i++) {
    toolCalls.push({
      name: 'search',
      args: { query: i === 0 ? prompt : 'related topics' }
    });
  }

  return {
    output: `Found ${searches} result(s) for "${prompt}". Here's what I discovered...`,
    toolCalls,
    tokens: { prompt: 50, completion: 30, total: 80 },
    durationMs: 150
  };
};

test('agent performs single search', async () => {
  await runAgent(searchAgent, 'AI testing');

  expect().toCallToolTimes('search', { exactly: 1 });
  expect().toCallToolWith('search', { query: 'AI testing' });
  expect().toMention('discovered');
});

test('agent performs multiple searches', async () => {
  await runAgent(searchAgent, 'multiple search query');

  expect().toCallToolTimes('search', { min: 2 });
  expect().toCallToolWith('search', { query: 'multiple search query' });
  expect().toMention('2 result');
});

test('agent responds quickly', async () => {
  await runAgent(searchAgent, 'quick test');

  expect().toRespondIn({ ms: 500 });
  expect().toCallTool('search');
});

test('custom validation with toSatisfy', async () => {
  await runAgent(searchAgent, 'test query');

  expect().toSatisfy(
    (result) => result.toolCalls.length > 0,
    'Agent must call at least one tool'
  );

  expect().toSatisfy(
    (result) => result.output.includes('Found'),
    'Output must start with Found'
  );
});

test('negation assertions', async () => {
  await runAgent(searchAgent, 'simple query');

  expect().not.toCallTool('database');
  expect().not.toMention('error');
});

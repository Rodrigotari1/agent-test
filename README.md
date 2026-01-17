# agent-eval

Testing framework for AI agents with a Jest-like API.

## Installation

```bash
npm install agent-eval
```

## Quick Start

```javascript
const { test, runAgent, expect } = require('agent-eval');

const myAgent = async (prompt) => {
  return {
    output: `Response to: ${prompt}`,
    toolCalls: [{ name: 'searchWeb', args: { query: prompt } }]
  };
};

test('agent uses search tool', async () => {
  await runAgent(myAgent, 'What is the weather?');
  expect().toCallTool('searchWeb');
});

test('agent responds with text', async () => {
  await runAgent(myAgent, 'Hello');
  expect().toMention('Response');
});
```

Run tests:

```bash
npx agent-eval
```

## API

### Test Definition

```javascript
test('test name', async () => {
  // test code
});
```

### Running Agents

```javascript
await runAgent(agentFunction, prompt);
```

Agent function signature:

```typescript
type AgentFunction = (prompt: string) => Promise<{
  output: string;
  toolCalls: Array<{ name: string; args?: Record<string, unknown> }>;
  tokens?: { prompt: number; completion: number; total: number };
  durationMs?: number;
}>;
```

### Assertions

```javascript
expect().toCallTool('toolName')
expect().toCallToolWith('toolName', { arg: 'value' })
expect().toCallToolTimes('toolName', { exactly: 2 })
expect().toCallToolTimes('toolName', { min: 1, max: 3 })
expect().toMention('text in output')
expect().toRespondIn({ ms: 1000 })
expect().toSatisfy(result => result.output.length > 10)

expect().not.toCallTool('toolName')
expect().not.toMention('text')
```

### Hooks

```javascript
beforeEach(async () => {
  // runs before each test
});

afterEach(async () => {
  // runs after each test
});
```

## CLI Usage

```bash
agent-eval [pattern] [options]
```

Options:

- `--reporter, -r <type>` - Reporter type: default, verbose, minimal, json
- `--grep, -g <pattern>` - Run only tests matching pattern
- `--bail, -b` - Stop on first failure
- `--timeout, -t <ms>` - Timeout per test

Examples:

```bash
agent-eval "tests/**/*.test.js"
agent-eval --reporter verbose
agent-eval --grep "search"
agent-eval --bail
```

## Configuration

Create `.agent-eval.json`:

```json
{
  "pattern": "tests/**/*.test.js",
  "reporter": "default",
  "timeout": 30000,
  "bail": false
}
```

Or in `package.json`:

```json
{
  "agent-eval": {
    "pattern": "tests/**/*.test.js",
    "reporter": "verbose"
  }
}
```

Or `agent-eval.config.js`:

```javascript
module.exports = {
  pattern: 'tests/**/*.test.js',
  reporter: 'default'
};
```

## Reporters

### Default

```
Running 3 tests...

  ✓ test 1 (5ms)
  ✓ test 2 (3ms)
  ✗ test 3 (2ms)
    Error: Expected agent to call tool "search"

Tests: 2 passed, 1 failed, 3 total
Time:  10ms
```

### Verbose

Shows full error stacks and token usage.

### Minimal

```
..F

2/3 passed

Failures:
  - test 3
    Expected agent to call tool "search"
```

### JSON

Machine-readable output for CI integration.

## Advanced Example

```javascript
const { test, runAgent, expect, beforeEach, afterEach } = require('agent-eval');

let callCount = 0;

beforeEach(() => {
  callCount = 0;
});

afterEach(() => {
  console.log(`Test made ${callCount} calls`);
});

test('agent makes multiple searches', async () => {
  const agent = async (prompt) => {
    callCount++;
    return {
      output: `Found results for ${prompt}`,
      toolCalls: [
        { name: 'search', args: { query: prompt } },
        { name: 'search', args: { query: 'related' } }
      ],
      tokens: { prompt: 100, completion: 50, total: 150 },
      durationMs: 250
    };
  };

  await runAgent(agent, 'AI research');

  expect().toCallToolTimes('search', { exactly: 2 });
  expect().toCallToolWith('search', { query: 'AI research' });
  expect().toMention('Found results');
  expect().toRespondIn({ ms: 500 });
});

test('custom validation', async () => {
  await runAgent(myAgent, 'test');

  expect().toSatisfy(
    result => result.toolCalls.length > 0,
    'Agent must call at least one tool'
  );
});
```

## License

MIT

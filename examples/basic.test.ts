import { test, runAgent, expect, runTests } from '../src/index';
import { AgentFunction } from '../src/types';

const mockWeatherAgent: AgentFunction = async (prompt: string) => {
  return {
    output: `The weather in ${prompt} is sunny and 72 degrees`,
    toolCalls: [
      { name: 'getWeather', args: { city: prompt } }
    ]
  };
};

test('weather agent calls getWeather tool', async () => {
  await runAgent(mockWeatherAgent, 'San Francisco');
  expect().toCallTool('getWeather');
});

test('weather agent mentions temperature', async () => {
  await runAgent(mockWeatherAgent, 'New York');
  expect().toMention('degrees');
});

test('weather agent mentions the city', async () => {
  await runAgent(mockWeatherAgent, 'Boston');
  expect().toMention('Boston');
});

async function main() {
  console.log('Running tests...\n');
  const results = await runTests();

  results.forEach(result => {
    const icon = result.passed ? '✓' : '✗';
    console.log(`  ${icon} ${result.name}`);
    if (result.error) {
      console.log(`    Error: ${result.error.message}`);
    }
  });

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`\n${passed}/${total} tests passed`);

  process.exit(passed === total ? 0 : 1);
}

main();

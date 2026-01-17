const { test, runAgent, expect } = require('../dist/index');

const mockWeatherAgent = async (prompt) => {
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

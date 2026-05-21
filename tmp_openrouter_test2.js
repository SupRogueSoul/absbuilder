const fs = require('fs');
const path = require('path');
const envPath = path.resolve('.env.local');
const env = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});
const key = env.OPENROUTER_API_KEY;
const endpoints = [
  'https://openrouter.ai/api/v1/chat/completions',
  'https://openrouter.ai/api/v1/completions',
  'https://api.openrouter.ai/api/v1/chat/completions',
  'https://api.openrouter.ai/api/v1/completions',
];
const results = [];
(async () => {
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Say hi.' },
          ],
          temperature: 0.7,
        }),
      });
      const body = await res.text();
      results.push({ url, status: res.status, statusText: res.statusText, body: body.slice(0, 1000) });
    } catch (error) {
      results.push({ url, error: error.message });
    }
  }
  fs.writeFileSync('tmp_openrouter_result.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('done');
})();

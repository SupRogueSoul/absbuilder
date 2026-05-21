const fs = require('fs');
const path = require('path');
const envPath = path.resolve('.env.local');
if (!fs.existsSync(envPath)) {
  throw new Error('.env.local not found');
}
const env = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});
const key = env.OPENROUTER_API_KEY;
if (!key) {
  throw new Error('OPENROUTER_API_KEY is missing');
}
(async () => {
  try {
    const res = await fetch('https://openrouter.ai/v1/chat/completions', {
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
    console.log('STATUS', res.status, res.statusText);
    const body = await res.text();
    console.log(body);
  } catch (error) {
    console.error(error);
  }
})();

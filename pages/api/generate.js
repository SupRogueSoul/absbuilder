import { GoogleGenerativeAI } from '@google/generative-ai';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const extractSiteName = (p) => {
  const lower = p.toLowerCase();
  if (lower.includes('portfolio')) return 'My Portfolio';
  if (lower.includes('shop') || lower.includes('store')) return 'My Shop';
  if (lower.includes('restaurant') || lower.includes('cafe') || lower.includes('coffee')) return 'My Restaurant';
  if (lower.includes('agency')) return 'My Agency';
  if (lower.includes('blog')) return 'My Blog';
  if (lower.includes('saas') || lower.includes('startup')) return 'My SaaS';

  const words = p
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => {
      const stopWords = ['a', 'an', 'the', 'website', 'design', 'make', 'build', 'for', 'of', 'and', 'to', 'in', 'with', 'on', 'my'];
      return w && !stopWords.includes(w.toLowerCase());
    });

  if (words.length >= 2) {
    const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    return `${cap(words[0])} ${cap(words[1])} Site`;
  } else if (words.length === 1) {
    const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    return `${cap(words[0])} Site`;
  }
  return 'My Awesome Site';
};

/** Strip markdown code fences that some models add around HTML */
const stripCodeFences = (text) =>
  text
    .replace(/^```(?:html)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

const getFallbackHTML = (prompt) => {
  const name = extractSiteName(prompt);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap');
    :root { --bg:#050508; --surface:#0d0d14; --surface2:#13131e; --border:#1e1e2e; --text:#f0f0ff; --muted:#8888aa; --accent:#6c63ff; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; line-height:1.6; display:flex; flex-direction:column; min-height:100vh; }
    .fallback-banner { background:linear-gradient(90deg,#ef4444,#f97316); color:#fff; padding:10px 20px; text-align:center; font-size:.85rem; font-weight:700; }
    header { border-bottom:1px solid var(--border); padding:20px 40px; display:flex; justify-content:space-between; align-items:center; background:var(--surface); }
    .logo { font-family:'Syne',sans-serif; font-weight:800; font-size:1.25rem; }
    .hero { max-width:800px; margin:80px auto; text-align:center; padding:0 20px; flex:1; }
    h1 { font-family:'Syne',sans-serif; font-size:3rem; line-height:1.1; margin-bottom:20px; background:linear-gradient(135deg,#fff 40%,var(--accent) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .hero p { color:var(--muted); font-size:1.15rem; margin-bottom:30px; }
    .prompt-box { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:20px; margin:30px 0; text-align:left; }
    .prompt-label { font-size:.75rem; font-weight:700; color:var(--accent); text-transform:uppercase; margin-bottom:8px; }
    .btn { display:inline-block; background:var(--accent); color:#fff; padding:12px 30px; border-radius:8px; text-decoration:none; font-weight:700; }
    footer { border-top:1px solid var(--border); padding:30px; text-align:center; color:var(--muted); font-size:.9rem; }
  </style>
</head>
<body>
  <div class="fallback-banner">⚠️ Demo Mode — AI generator unavailable. Add a GEMINI_API_KEY to .env.local to enable generation.</div>
  <header><div class="logo">⚡ ${name}</div></header>
  <div class="hero">
    <h1>${name}</h1>
    <p>Your website is ready to be generated. Configure your API key to get a real AI-generated site.</p>
    <div class="prompt-box"><div class="prompt-label">Your Prompt:</div><p style="font-size:.95rem">${prompt}</p></div>
    <a href="#" class="btn">Explore Features</a>
  </div>
  <footer><p>&copy; 2026 ${name}. Powered by ABSBuilder.</p></footer>
</body>
</html>`;
};

// ---------------------------------------------------------------------------
// Gemini direct API (primary — free tier: 15 req/min, 1500 req/day)
// ---------------------------------------------------------------------------
async function generateWithGemini(geminiKey, fullPrompt) {
  const genAI = new GoogleGenerativeAI(geminiKey);
  for (const modelName of ['gemini-2.0-flash-lite', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-8b']) {
    try {
      console.log(`Trying Gemini model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();
      if (text) {
        console.log(`Gemini success with: ${modelName}`);
        return stripCodeFences(text);
      }
    } catch (err) {
      console.warn(`Gemini ${modelName} failed:`, err.message);
      // If quota exceeded, try next model; if invalid key, stop
      if (err.message && err.message.includes('API_KEY_INVALID')) break;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// OpenRouter fallback (free models, best-effort)
// ---------------------------------------------------------------------------
async function generateWithOpenRouter(openRouterKey, systemPrompt, userMessage) {
  const modelsToTry = [
    'google/gemma-4-31b-it:free',
    'openai/gpt-oss-20b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemma-4-26b-a4b-it:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
  ];

  for (const model of modelsToTry) {
    console.log(`Trying OpenRouter model: ${model}`);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'ABSBuilder',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 8000,
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn(`OpenRouter ${model} failed (${response.status}):`, data?.error?.message);
        if (response.status === 401 || response.status === 403) break; // auth error, stop trying
        continue;
      }

      const raw = data?.choices?.[0]?.message?.content;
      if (raw) {
        console.log(`OpenRouter success with: ${model}`);
        return stripCodeFences(raw);
      }
    } catch (err) {
      console.warn(`OpenRouter ${model} threw:`, err.message);
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { mode, prompt, currentHTML } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const hasGemini = geminiKey && geminiKey !== 'your_gemini_api_key_here';
  const hasOpenRouter = !!openRouterKey;

  if (!hasGemini && !hasOpenRouter) {
    console.warn('No API keys configured — returning fallback template.');
    return res.status(200).json({ html: getFallbackHTML(prompt), fallback: true });
  }

  // Build prompts
  let systemPrompt = '';
  let userMessage = '';
  let geminiFullPrompt = '';

  if (mode === 'generate') {
    systemPrompt = `You are an elite web designer and front-end engineer. Create a breathtaking, fully self-contained single-file HTML website.
Rules:
1. Return ONLY raw HTML — no markdown, no backticks, no explanation.
2. Everything in one file: HTML + <style> + <script>.
3. Use Google Fonts via @import in <style>.
4. Make it visually stunning — modern, responsive, professional.
5. Include smooth scroll, hover effects, and subtle CSS animations.
6. Fully mobile-responsive with media queries.
7. Use semantic HTML5.
8. NO placeholder images — use CSS gradients or SVG shapes.
9. Include: navbar, hero, at least 2 content sections, footer.
10. Choose a cohesive color palette that fits the described purpose.`;
    userMessage = `Create a website for this description: "${prompt}"`;
    geminiFullPrompt = `${systemPrompt}\n\n${userMessage}`;

  } else if (mode === 'edit') {
    systemPrompt = `You are an elite web designer making targeted edits to an existing website.
Rules:
1. Return ONLY the complete updated raw HTML — no markdown, no backticks, no explanation.
2. Preserve all existing design quality — only apply the requested change.
3. Keep all sections, modify only what was asked.
4. Output must be a complete, valid, self-contained HTML file.`;
    userMessage = `Here is the current HTML:\n\`\`\`html\n${currentHTML}\n\`\`\`\n\nPlease apply this edit: "${prompt}"`;
    geminiFullPrompt = `${systemPrompt}\n\n${userMessage}`;

  } else {
    return res.status(400).json({ message: 'Invalid mode' });
  }

  try {
    let html = null;

    // 1. Try Gemini first (reliable free tier)
    if (hasGemini) {
      html = await generateWithGemini(geminiKey, geminiFullPrompt);
    }

    // 2. Fall back to OpenRouter free models
    if (!html && hasOpenRouter) {
      console.log('Gemini unavailable, trying OpenRouter...');
      html = await generateWithOpenRouter(openRouterKey, systemPrompt, userMessage);
    }

    // 3. Nothing worked
    if (!html) {
      return res.status(503).json({
        message: hasGemini
          ? 'Gemini API failed and all OpenRouter free models are rate-limited. Please try again in a moment.'
          : 'All OpenRouter free models are currently rate-limited. Add a GEMINI_API_KEY to .env.local for reliable generation.',
      });
    }

    return res.status(200).json({ html, fallback: false });

  } catch (error) {
    console.error('Unexpected error in generate handler:', error.message);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
}

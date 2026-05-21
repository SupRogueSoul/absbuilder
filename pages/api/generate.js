import { GoogleGenerativeAI } from '@google/generative-ai';

// Name extraction logic
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
    
    :root {
      --bg: #050508;
      --surface: #0d0d14;
      --surface2: #13131e;
      --border: #1e1e2e;
      --text: #f0f0ff;
      --muted: #8888aa;
      --accent: #6c63ff;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .fallback-banner {
      background: linear-gradient(90deg, #ef4444 0%, #f97316 100%);
      color: #fff;
      padding: 10px 20px;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 700;
      font-family: 'Syne', sans-serif;
    }
    
    header {
      border-bottom: 1px solid var(--border);
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--surface);
    }
    
    .logo {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 1.25rem;
      color: var(--text);
    }
    
    .hero {
      max-width: 800px;
      margin: 80px auto;
      text-align: center;
      padding: 0 20px;
      flex: 1;
    }
    
    h1 {
      font-family: 'Syne', sans-serif;
      font-size: 3rem;
      line-height: 1.1;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #ffffff 40%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .hero p {
      color: var(--muted);
      font-size: 1.15rem;
      margin-bottom: 30px;
    }
    
    .prompt-box {
      background-color: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: left;
    }
    
    .prompt-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .btn {
      display: inline-block;
      background-color: var(--accent);
      color: #fff;
      padding: 12px 30px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      transition: all 0.2s;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
    }
    
    footer {
      border-top: 1px solid var(--border);
      padding: 30px;
      text-align: center;
      color: var(--muted);
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="fallback-banner">
    ⚠️ Demo Mode: This page was generated locally using a fallback template because your Gemini API key is not configured or failed.
  </div>
  
  <header>
    <div class="logo">⚡ ${name}</div>
  </header>
  
  <div class="hero">
    <h1>${name}</h1>
    <p>Welcome to your newly generated website. This fallback layout is active because the external AI generator could not be reached.</p>
    
    <div class="prompt-box">
      <div class="prompt-label">Your Prompt:</div>
      <p style="font-size: 0.95rem;">${prompt}</p>
    </div>
    
    <a href="#" class="btn">Explore Features</a>
  </div>
  
  <footer>
    <p>&copy; 2026 ${name}. Powered by ABSBuilder.</p>
  </footer>
</body>
</html>`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { mode, prompt, currentHTML } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  // Prefer OpenRouter if available, otherwise use GEMINI_API_KEY for Google Generative AI
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openRouterKey && (!geminiKey || geminiKey === 'your_gemini_api_key_here')) {
    console.warn('No OpenRouter or Gemini API key set. Falling back to local template.');
    const html = getFallbackHTML(prompt);
    return res.status(200).json({ html, fallback: true });
  }

  let systemPrompt = '';
  let userMessageContent = '';

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

    userMessageContent = `Create a website for this description: "${prompt}"`;
  } else if (mode === 'edit') {
    systemPrompt = `You are an elite web designer making targeted edits to an existing website.
Rules:
1. Return ONLY the complete updated raw HTML — no markdown, no backticks, no explanation.
2. Preserve all existing design quality — only apply the requested change.
3. Keep all sections, modify only what was asked.
4. Output must be a complete, valid, self-contained HTML file.`;

    userMessageContent = `Here is the current HTML:
\`\`\`html
${currentHTML}
\`\`\`

Please apply this edit: "${prompt}"`;
  } else {
    return res.status(400).json({ message: 'Invalid mode' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${openRouterKey}`,
      },
      body: JSON.stringify({
        model: '~openai/gpt-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessageContent },
        ],
        max_tokens: 650,
        temperature: 0.7,
      }),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      data = null;
    }

    if (!response.ok) {
      const message = data?.error?.message || response.statusText || 'OpenRouter API error';
      const html = getFallbackHTML(prompt);
      return res.status(200).json({ html, fallback: true, error: message });
    }

    const html = data?.choices?.[0]?.message?.content || getFallbackHTML(prompt);
    const fallback = !data?.choices?.[0]?.message?.content;

    return res.status(200).json({ html, fallback, error: fallback ? 'OpenRouter returned empty content.' : null });
  } catch (error) {
    console.error('Error communicating with OpenRouter API:', error);
    const html = getFallbackHTML(prompt);
    return res.status(200).json({ html, fallback: true, error: error.message });
  }
}

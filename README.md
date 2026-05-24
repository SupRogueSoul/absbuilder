<div align="center">

# ⚡ ABSBuilder

### AI-Powered Website Builder

**Generate stunning, fully responsive websites from a single text prompt.**  
Describe your idea. Watch it build. Edit with chat.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-AI%20Engine-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-Fallback%20AI-FF6B35?style=for-the-badge)](https://openrouter.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Live Demo](#) · [Report Bug](https://github.com/SupRogueSoul/absbuilder/issues) · [Request Feature](https://github.com/SupRogueSoul/absbuilder/issues)

![ABSBuilder Preview](https://via.placeholder.com/900x500/050508/6c63ff?text=ABSBuilder+%E2%80%94+AI+Website+Builder)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Supabase Setup](#supabase-setup)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [AI Model Pipeline](#-ai-model-pipeline)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧠 About

**ABSBuilder** is a full-stack AI website builder inspired by [Lovable.ai](https://lovable.ai). It lets anyone — designer or not — generate a complete, production-ready website by simply describing what they want in plain English.

The generated output is a **fully self-contained single-file HTML website** with embedded CSS animations, responsive layouts, working navigation, and multiple content sections. Users can then refine their site through a conversational AI chat interface, switch between desktop/tablet/mobile previews, copy the raw HTML, or download a complete Vite-ready project package.

Every site is stored per-user in a Supabase database with Row Level Security, ensuring complete data isolation between accounts.

---

## ✨ Features

### 🎨 Generation
- **Natural language to website** — describe your site in plain English and get a complete multi-section HTML site
- **Multi-section output** — every generated site includes: sticky navbar, hero, services/features, portfolio/work, pricing or about, testimonials, contact form, and footer
- **Working navigation** — anchor-based links with JavaScript scroll spy that highlights the active section
- **Realistic content** — no lorem ipsum; the AI generates contextually appropriate copy for every section

### 🛠️ Builder Workspace
- **Live iframe preview** — see your site rendered in real time inside the builder
- **Responsive viewport toggle** — switch between Desktop, Tablet (768px), and Mobile (375px) views
- **AI chat editing** — send natural language commands to update any part of your site
- **Quick-edit pills** — one-click shortcuts: *Make it a light theme*, *Add testimonials*, *Change font to serif*, *Add pricing table*, *Make the hero bigger*
- **Raw HTML viewer** — inspect and copy the full generated source code
- **Rename with limit** — rename your site up to 2 times with global uniqueness enforcement

### 📦 Export
- **Copy HTML** — one-click copy of the full HTML to clipboard
- **Download Project ZIP** — exports a complete Vite-structured project with:
  - `index.html` — your generated site
  - `package.json` — with `dev`, `build`, and `preview` scripts
  - `vite.config.js` — pre-configured dev server
  - `README.md` — setup instructions

### 🔐 Auth & Data
- **Email/password signup and login**
- **Google OAuth** — one-click sign in with Google
- **Per-user site storage** — all sites isolated by user via Supabase RLS
- **Global site name uniqueness** — no two sites across all users can share the same name
- **Session persistence** — auth state managed globally via React Context

### 🤖 AI Reliability
- **Multi-model fallback chain** — if one model fails, the next is tried automatically
- **Gemini primary** — fast, free, reliable (15 req/min, 1500 req/day)
- **OpenRouter fallback** — 5 free models tried in sequence if Gemini is unavailable
- **Markdown fence stripping** — cleans AI output that wraps HTML in code blocks

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (Pages Router) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Authentication** | [Supabase Auth](https://supabase.com/auth) + Google OAuth |
| **AI — Primary** | [Google Gemini API](https://ai.google.dev/) (`gemini-2.0-flash-lite`) |
| **AI — Fallback** | [OpenRouter](https://openrouter.ai/) (free model chain) |
| **ZIP Export** | [JSZip](https://stuk.github.io/jszip/) |
| **Styling** | CSS Modules + Google Fonts (DM Sans, Syne) |
| **Deployment** | [Vercel](https://vercel.com/) (recommended) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A [Supabase](https://supabase.com/) account (free tier works)
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (free)
- *(Optional)* An [OpenRouter](https://openrouter.ai/) API key for fallback

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SupRogueSoul/absbuilder.git
cd absbuilder

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# Google Gemini API — Primary AI engine (free tier)
# Get your key at: https://aistudio.google.com/apikey
GEMINI_API_KEY=AIzaSy...

# OpenRouter API — Fallback AI engine (optional)
# Get your key at: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-...

# Supabase — Database & Authentication
# Find these in: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Note:** `GEMINI_API_KEY` is required for AI generation. `OPENROUTER_API_KEY` is optional but recommended as a fallback.

---

### Supabase Setup

#### 1. Create the `sites` table

Run this in your **Supabase SQL Editor**:

```sql
CREATE TABLE public.sites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  color text,
  initial text,
  prompt text,
  generated_html text,
  rename_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT sites_slug_unique UNIQUE (slug)
);
```

#### 2. Enable Row Level Security

```sql
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sites"
ON public.sites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sites"
ON public.sites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites"
ON public.sites FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sites"
ON public.sites FOR DELETE USING (auth.uid() = user_id);
```

#### 3. Enable Google OAuth *(optional)*

In your Supabase dashboard go to **Authentication → Providers → Google** and follow the setup guide.

#### 4. Disable email confirmation *(for development)*

Go to **Authentication → Providers → Email** and toggle **Confirm email** off.

---

## 📁 Project Structure

```
absbuilder/
├── lib/
│   └── supabaseClient.js       # Supabase client with graceful mock fallback
├── pages/
│   ├── _app.js                 # Global auth context + toast notification system
│   ├── index.js                # Public landing page
│   ├── login.js                # Email/password + Google OAuth login
│   ├── signup.js               # Registration with name, email, password
│   ├── dashboard.js            # User dashboard — site management + creation modal
│   ├── builder/
│   │   └── [id].js             # Builder workspace — preview, chat, rename, export
│   └── api/
│       └── generate.js         # AI generation API route (Gemini + OpenRouter)
├── styles/
│   ├── globals.css             # Global CSS variables and resets
│   ├── Landing.module.css      # Landing page styles
│   ├── Auth.module.css         # Login/signup styles
│   ├── Dashboard.module.css    # Dashboard styles
│   └── Builder.module.css      # Builder workspace styles
├── .env.example                # Environment variable template
├── next.config.js
└── package.json
```

---

## ⚙️ How It Works

```
User enters prompt
       │
       ▼
Dashboard (3-step modal)
  Step 1: Describe website
  Step 2: Choose unique name → checked against Supabase
  Step 3: Review & Generate
       │
       ▼
POST /api/generate { mode: "generate", prompt }
       │
       ├─► Try Gemini (gemini-2.0-flash-lite → gemini-1.5-flash-latest → gemini-1.5-flash-8b)
       │
       └─► If Gemini fails → Try OpenRouter free models
               (gemma-4-31b → gpt-oss-20b → llama-3.3-70b → gemma-4-26b → hermes-3-405b)
       │
       ▼
HTML returned → Saved to Supabase sites table
       │
       ▼
Redirect to /builder/[id]
       │
       ▼
Builder workspace loads site from Supabase
  ├── Live iframe preview
  ├── Viewport toggle (Desktop / Tablet / Mobile)
  ├── AI chat → POST /api/generate { mode: "edit", currentHTML }
  ├── Rename (up to 2 times, globally unique)
  └── Export → Copy HTML or Download ZIP
```

---

## 🤖 AI Model Pipeline

The generation API tries models in this order, moving to the next on any failure:

| Priority | Provider | Model | Notes |
|---|---|---|---|
| 1 | Google Gemini | `gemini-2.0-flash-lite` | Primary — fast & free |
| 2 | Google Gemini | `gemini-1.5-flash-latest` | Gemini fallback |
| 3 | Google Gemini | `gemini-1.5-flash-8b` | Gemini fallback |
| 4 | OpenRouter | `google/gemma-4-31b-it:free` | Free tier |
| 5 | OpenRouter | `openai/gpt-oss-20b:free` | Free tier |
| 6 | OpenRouter | `meta-llama/llama-3.3-70b-instruct:free` | Free tier |
| 7 | OpenRouter | `google/gemma-4-26b-a4b-it:free` | Free tier |
| 8 | OpenRouter | `nousresearch/hermes-3-llama-3.1-405b:free` | Free tier |

---

## 📸 Screenshots

| Landing Page | Dashboard | Builder |
|---|---|---|
| ![Landing](https://via.placeholder.com/280x180/050508/6c63ff?text=Landing) | ![Dashboard](https://via.placeholder.com/280x180/050508/a78bfa?text=Dashboard) | ![Builder](https://via.placeholder.com/280x180/050508/3b82f6?text=Builder) |

---

## 🗺️ Roadmap

- [x] AI website generation from text prompt
- [x] Multi-section site output with working navigation
- [x] Live iframe preview with viewport switching
- [x] AI chat-based editing
- [x] ZIP project download (Vite-structured)
- [x] Google OAuth
- [x] Global site name uniqueness
- [x] Site rename with 2-rename limit
- [ ] Real domain publishing (Vercel/Netlify integration)
- [ ] Custom color palette picker before generation
- [ ] Version history / undo for edits
- [ ] Drag-and-drop block editor
- [ ] Team collaboration
- [ ] Custom SMTP for email confirmation

---

## 🤝 Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please make sure your code follows the existing style and doesn't commit `.env.local` or any API keys.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

Built with ❤️ using [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), and [Google Gemini](https://ai.google.dev/)

⭐ **Star this repo if you found it useful!**

</div>

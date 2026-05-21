# ABSBuilder - AI Website Generator

ABSBuilder is a production-ready web application built using Next.js 14 (Pages Router). It allows users to write simple English prompts to dynamically generate and customize websites using the Google Gemini API, saving their projects and authentication credentials in a Supabase Database.

---

## 🛠️ Tech Stack & Features

- **Google Gemini API**: Harnesses the power of `gemini-2.5-pro` (with automatic fallback to `gemini-2.5-flash`) to generate self-contained responsive layouts.
- **Supabase Authentication**: True multi-user login and signup with secure encryption and session listeners.
- **Supabase Database**: Stores generated page scripts, prompt queries, metadata, and user links.
- **Vite Export Zip**: Pack and download the website as a fully configured static Vite application, containing a development server config, `package.json`, and run guides.

---

## 🚀 Getting Started

### 1. Install Dependencies
Run the installation script in the root directory:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the template configuration file to configure your keys:
```bash
cp .env.example .env.local
```
Open `.env.local` and paste your Google Gemini API Key and Supabase project tokens:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```
> [!NOTE]
> Obtain your Gemini API Key from Google AI Studio at [aistudio.google.com](https://aistudio.google.com/).  
> Obtain Supabase variables by creating a project on [supabase.com](https://supabase.com/) and checking **Project Settings > API**.

### 3. Database Schema Setup
Execute the following query inside the Supabase SQL Editor to create the necessary table structure for storing generated websites:
```sql
create table sites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text not null,
  prompt text,
  generated_html text,
  color text,
  initial text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 4. Run Locally
Start the local Next.js development server:
```bash
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the landing page.

---

## 📦 Local Project Execution (ZIP Download Output)

When clicking **Download Project** inside the live builder workspace, ABSBuilder compiles and downloads a ZIP file containing the following structure:
- `index.html`: The generated web layout, styled templates, and scripts.
- `package.json`: Configurations for Vite compilation and local development servers.
- `vite.config.js`: Port bindings and page hot-reloads.
- `README.md`: Explaining local dependency installs.

To boot the downloaded zip project:
```bash
npm install
npm run dev
```

---

## Vercel Deployment Steps

Follow these steps to deploy ABSBuilder to Vercel:

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```
2. **Login and Setup Project**:
   Run the deploy command in the root folder:
   ```bash
   vercel
   ```
   Follow the prompts to link the project to your Vercel account.
3. **Configure Environment Variables on Vercel**:
   Go to the Vercel dashboard, choose your project, and navigate to **Settings > Environment Variables**.
   Add the following environment variables:
   - **Key**: `GEMINI_API_KEY`
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

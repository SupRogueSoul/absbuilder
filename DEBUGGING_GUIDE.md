# ABSBuilder - Debugging Guide

## Two Errors You're Seeing:
1. **"Generation failed check API key or connection"** 
2. **"Failed to load websites from database"**

---

## Error #1: Generation Failed (OpenRouter API)

### Quick Fix - Check Your Terminal Console

Run your app and look for OpenRouter error details in the terminal running `npm run dev`:

```
OpenRouter API Error: {
  status: 401,
  error: "Unauthorized"
}
```

### Common Causes:

#### A. Invalid API Key Format
- Your .env.local has: `OPENROUTER_API_KEY=sk-or-v1-...`
- Check if the full key is correctly pasted (no spaces, newlines, or truncation)
- Test key here: https://openrouter.ai/api/v1/models (add Bearer token in Authorization header)

#### B. Model Name Issue
- Changed from `~openai/gpt-latest` to `openai/gpt-4`
- If you want cheaper/faster, try: `openai/gpt-3.5-turbo`
- Test available models: https://openrouter.ai/docs#models

#### C. Rate Limiting / Quota
- Check your OpenRouter account: https://openrouter.ai/account
- Verify you have API credits/balance
- Check rate limit in response headers

### Verification Steps:

1. **Check env var is loaded:**
   - Add this to `pages/api/generate.js` temporarily:
   ```javascript
   console.log('OpenRouter Key exists:', !!process.env.OPENROUTER_API_KEY);
   console.log('First 10 chars:', process.env.OPENROUTER_API_KEY?.substring(0, 10));
   ```

2. **Test OpenRouter directly** (in browser console or Node):
   ```javascript
   const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer sk-or-v1-YOUR_KEY_HERE',
     },
     body: JSON.stringify({
       model: 'openai/gpt-4',
       messages: [{ role: 'user', content: 'Hello' }],
       max_tokens: 100,
     }),
   });
   console.log(await response.json());
   ```

---

## Error #2: Failed to Load Websites from Database

This is likely a **Supabase Row Level Security (RLS)** issue.

### Quick Fix: Disable RLS (Development Only)

⚠️ **ONLY FOR LOCAL DEVELOPMENT** - Never do this in production!

1. Go to https://supabase.com → Your Project → Tables
2. Click on `sites` table
3. Open "Auth" tab or find RLS settings
4. **Toggle RLS OFF** for the `sites` table temporarily
5. Try again

### Proper Fix: Add RLS Policies

If you want RLS enabled (recommended):

1. Go to Supabase → `sites` table → "Auth" → "RLS"
2. Create policies:

**Policy 1: Users can read their own sites**
```sql
create policy "Users can read own sites"
on public.sites for select
to authenticated
using (auth.uid()::text = user_id);
```

**Policy 2: Users can insert their own sites**
```sql
create policy "Users can insert own sites"
on public.sites for insert
to authenticated
with check (auth.uid()::text = user_id);
```

**Policy 3: Users can update their own sites**
```sql
create policy "Users can update own sites"
on public.sites for update
to authenticated
using (auth.uid()::text = user_id);
```

**Policy 4: Users can delete their own sites**
```sql
create policy "Users can delete own sites"
on public.sites for delete
to authenticated
using (auth.uid()::text = user_id);
```

### Verify Table Schema

The `sites` table should have these columns:
- `id` (UUID, primary key, auto-generated)
- `user_id` (TEXT or UUID) - matches your auth.uid()
- `name` (TEXT)
- `slug` (TEXT)
- `color` (TEXT)
- `initial` (TEXT)
- `prompt` (TEXT)
- `generated_html` (TEXT)
- `created_at` (TIMESTAMP) - **IMPORTANT: Auto-insert current time**

**Missing `created_at`?** Add it:
1. Go to Supabase → `sites` table
2. Click "+" to add column
3. Set: Name: `created_at`, Type: `timestamp`, Default: `now()`

### Verification in Browser Console

1. Open DevTools (F12) → Console
2. Run:
   ```javascript
   const { data, error } = await window.supabase.from('sites').select('*').limit(1);
   console.log(data, error);
   ```

3. If you see RLS error, that's the problem. If you see data, RLS is fine.

---

## Step-by-Step Troubleshooting

1. **Open terminal with `npm run dev` running**
2. **Check Console Logs:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Click "Create Website" or load dashboard
   - Look for error messages

3. **For API errors:** Look in terminal, not browser console
   - Find the OpenRouter error details
   - Compare with solutions above

4. **For DB errors:** Check RLS first
   - Try disabling RLS temporarily
   - If it works → implement RLS policies
   - If still fails → check schema matches code

---

## Advanced: Enable Request Logging

To see exactly what's happening, add this to `supabaseClient.js`:

```javascript
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth Event:', event, session?.user?.id);
});
```

And add to `pages/api/generate.js` after fetch:
```javascript
console.log('OpenRouter Response Status:', response.status);
console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
```

---

## Still Stuck? Check These:

- ✅ API key in .env.local (no spaces/newlines)
- ✅ Supabase project active and not paused
- ✅ Internet connection working
- ✅ No browser extension blocking requests
- ✅ Network tab shows request (F12 → Network)
- ✅ Supabase anon key is correct in .env.local

Run: `npm run dev` and refresh page after each fix!

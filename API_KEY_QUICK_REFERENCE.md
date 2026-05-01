# API Key Configuration - Quick Reference Card

## TL;DR - Do I Need an API Key?

| Deployment Method | API Key Needed? | What to Do |
|---|---|---|
| **Vercel** | ❌ NO | Just deploy, it works automatically |
| **Local Dev** | ✅ YES | Add `OPENAI_API_KEY` to v0 Settings → Vars |
| **Self-Hosted** | ✅ YES | Set env var on your server |

---

## Getting Your OpenAI API Key (If Needed)

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-`)
5. Save it somewhere safe - you won't see it again!

---

## Adding API Key for Local Development

### In v0 UI:
1. Click **Settings** (gear icon, top right)
2. Click **Vars** tab
3. Click **Add Variable**
4. Enter:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-xxxxx...` (your API key)
5. Click **Add**
6. Refresh your browser

---

## Adding API Key for Vercel Deployment

1. Go to your **Vercel Dashboard**
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add**
5. Enter:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-xxxxx...`
   - **Environments**: Select all (Production, Preview, Development)
6. Click **Save**
7. Redeploy your project

---

## Error Messages & What They Mean

| Error | Cause | Solution |
|---|---|---|
| ⚙️ Configuration Issue | API key missing/invalid | Add API key to environment variables |
| ⏳ Service Busy | Rate limit exceeded | Wait a few minutes, try again |
| 🌐 Connection Problem | Network issue | Check internet, try again |
| ⚡ Service Error | Backend error | Wait a few minutes, try again |
| ❌ Quiz Generation Failed | Unknown error | Check console logs, contact support |

---

## Verification Checklist

After setting up API key:

- [ ] Added `OPENAI_API_KEY` to environment variables
- [ ] Restarted dev server or redeployed
- [ ] Can navigate to `/assessment/quiz`
- [ ] Questions load successfully (no errors)
- [ ] Can answer questions and submit

---

## Troubleshooting

### Still Getting "Configuration Issue" Error?

1. Verify the API key is correct (no extra spaces)
2. Check it starts with `sk-proj-`
3. Make sure it's not expired or revoked
4. Wait a few seconds and refresh
5. Check browser console for more details (F12)

### Still Getting Errors After Checking Above?

1. Open browser console (F12 → Console)
2. Look for messages with `[v0]`
3. Contact support with the error message

---

## Cost Information

### Vercel Deployment
- Minimal cost (included in Vercel plan)
- Metered usage, no surprises

### Using Your Own OpenAI Key
- **Free tier**: $5 credit, no expiration
- **Pay as you go**: ~$0.15 per 1M tokens
- **Estimate**: ~$0.001 per quiz (5 questions)

Check usage at: https://platform.openai.com/usage

---

## Support

- 📖 Full guide: `/docs/API_KEY_SETUP.md`
- 🐛 Debugging: `/docs/QUIZ_TROUBLESHOOTING.md`
- 📧 Email: support@skilldebai.com
- 💬 Contact form: `/integrations` page


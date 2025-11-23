# 🚀 GospelPath.org - Quick Start

## What You Have Here

All the files needed to deploy your Bible study assistant with dual AI support (Groq + Claude).

---

## 📁 Files Included

```
gospelpath-backend/
├── api/
│   └── chat.js              # Your backend API (supports Groq + Claude)
├── .env.local.template      # Template for your API keys
├── .gitignore              # Tells Git what NOT to commit
├── vercel.json             # Vercel configuration
├── frontend-updates.js     # Updated JavaScript for your index.html
├── DEPLOYMENT.md           # Complete deployment guide (READ THIS!)
└── README.md               # This file
```

---

## ⚡ Quick Steps

### 1. **Read DEPLOYMENT.md**
   Open `DEPLOYMENT.md` - it has step-by-step instructions for everything.

### 2. **Add Files to Your Repository**
   ```bash
   # In your bible-study-assistant folder:
   
   # Create api folder
   mkdir api
   
   # Copy api/chat.js into api/
   # Copy vercel.json to root
   # Copy .gitignore to root
   # Copy .env.local.template to root
   ```

### 3. **Update Your index.html**
   - Open `frontend-updates.js`
   - Copy the JavaScript code
   - Replace your current `sendMessage()` function
   - Add the provider selector HTML (it's in the comments)

### 4. **Get Claude API Key**
   - Go to: https://console.anthropic.com
   - Sign up (free $5 credit)
   - Create API key
   - Save it securely

### 5. **Deploy to Vercel**
   - Go to: https://vercel.com
   - Sign up with GitHub
   - Import your repository
   - Add environment variables (GROQ_API_KEY, ANTHROPIC_API_KEY)
   - Deploy!

### 6. **Connect Your Domain**
   - In Vercel: Add gospelpath.org
   - In Porkbun: Update DNS records
   - Wait for propagation (10 min - 24 hours)

---

## 🎓 What's Different Now

**Before (Static Site):**
- Frontend called Groq API directly
- API key exposed in browser
- Only one AI model
- Limited scalability

**After (Full Stack App):**
- Frontend calls YOUR backend
- API keys hidden on server
- Multiple AI providers (Groq + Claude)
- Production-ready architecture
- Easy to add features (user accounts, etc.)

---

## 💰 Costs

- **Domains:** ~$20/year (gospelpath.org + gospeler.org)
- **Vercel:** $0 (free tier)
- **Groq:** $0 (free tier)
- **Claude:** $0 for first $5 credit (~500 questions)

**Total to start: ~$20/year**

---

## 🆘 Need Help?

1. **Read DEPLOYMENT.md** - answers 90% of questions
2. **Check Vercel logs** - shows errors clearly
3. **Test locally first** - before deploying
4. **Ask me!** - I'm here to help

---

## 🎯 Your Mission

Build this tool to **bring people closer to Christ** through deeper engagement with Scripture.

Every feature you add serves that mission!

---

**Ready? Open DEPLOYMENT.md and let's get you live!** 🚀

*"Your word is a lamp to my feet and a light to my path." - Psalm 119:105*

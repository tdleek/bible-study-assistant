# GospelPath.org Deployment Guide
## Bible Study Assistant with Dual AI Support (Groq + Claude)

---

## 🎯 **What You're Building**

A production-ready Bible study assistant that:
- ✅ Uses **FREE Llama** (via Groq) for all public users
- ✅ Uses **Premium Claude** for you to test quality differences
- ✅ Keeps API keys **secure** on the backend
- ✅ Deploys to **Vercel** (free hosting)
- ✅ Connects to your **gospelpath.org** domain
- ✅ Teaches you real-world AI development patterns

---

## 📋 **Prerequisites**

Before starting, you need:

1. ✅ GitHub account with your `bible-study-assistant` repository
2. ✅ Groq API key (you should have this already)
3. ✅ Domain purchased (gospelpath.org + gospeler.org)
4. ⬜ Claude API key (we'll get this together)
5. ⬜ Vercel account (we'll create this)

---

## 🔑 **Step 1: Get Your Claude API Key**

Claude offers $5 free credit to start - perfect for testing!

### Instructions:

1. **Go to Anthropic Console**
   - Visit: https://console.anthropic.com
   
2. **Sign Up / Log In**
   - Click "Sign Up" (or "Log In" if you have an account)
   - Use your email
   - Verify your email address

3. **Add Payment Method** (required even for free credit)
   - Go to Settings → Billing
   - Add a credit card
   - Don't worry - you get $5 free credit
   - You won't be charged until you use that up
   - At ~$0.01 per question, that's 500 questions free!

4. **Create API Key**
   - Go to Settings → API Keys
   - Click "Create Key"
   - Name it: "GospelPath Testing"
   - **Copy the key immediately** - you can't see it again!
   - Should look like: `sk-ant-api03-ABC123...`

5. **Save It Securely**
   - Paste it in a password manager or secure note
   - You'll need it for Vercel deployment

---

## 🚀 **Step 2: Prepare Your GitHub Repository**

You need to add the new backend files to your repository.

### Instructions:

1. **Download the new files**
   - I've created all the files you need
   - You should have:
     - `api/chat.js` (backend)
     - `vercel.json` (configuration)
     - `.env.local.template` (secrets template)
     - `frontend-updates.js` (updated JavaScript)

2. **Update your local repository**
   
   Open terminal/command prompt in your `bible-study-assistant` folder:
   
   ```bash
   # Create api folder
   mkdir api
   
   # Copy the chat.js file into api folder
   # (Download it from me and place it there)
   
   # Copy vercel.json to root
   # Copy .env.local.template to root
   ```

3. **Update your index.html**
   - Open your current `index.html`
   - Replace the `sendMessage()` function with the new one from `frontend-updates.js`
   - Add the provider selector HTML (it's in the comments)
   - Add the model switching functions

4. **Commit and push to GitHub**
   
   ```bash
   git add .
   git commit -m "Add backend API for secure multi-provider AI support"
   git push origin main
   ```

---

## ☁️ **Step 3: Deploy to Vercel**

Vercel will host your application for free!

### Instructions:

1. **Sign Up for Vercel**
   - Go to: https://vercel.com
   - Click "Sign Up"
   - Choose "Continue with GitHub"
   - Authorize Vercel to access your repositories

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Find your `bible-study-assistant` repository
   - Click "Import"

3. **Configure Environment Variables** (CRITICAL STEP!)
   
   Before clicking "Deploy", you need to add your API keys:
   
   - Click "Environment Variables" section
   - Add these two variables:
   
   **Variable 1:**
   - Name: `GROQ_API_KEY`
   - Value: [Paste your Groq API key]
   - Select: Production, Preview, Development (all three)
   
   **Variable 2:**
   - Name: `ANTHROPIC_API_KEY`
   - Value: [Paste your Claude API key from Step 1]
   - Select: Production, Preview, Development (all three)
   
   **WHY THIS MATTERS:**
   These environment variables keep your API keys secret!
   - They're encrypted on Vercel's servers
   - Never exposed to users
   - Never in your code/GitHub

4. **Deploy**
   - Click "Deploy"
   - Wait 30-60 seconds
   - Vercel builds and deploys automatically
   - You'll get a URL like: `bible-study-assistant.vercel.app`

5. **Test Your Deployment**
   - Click "Visit" to see your live site
   - Try the chat - it should work!
   - Test both Groq and Claude models
   - Check browser console for any errors

---

## 🌐 **Step 4: Connect Your Domain (gospelpath.org)**

Point your purchased domain to Vercel.

### In Vercel:

1. **Go to Your Project Dashboard**
   - Click on your `bible-study-assistant` project
   
2. **Go to Settings → Domains**
   - Click "Add Domain"
   - Enter: `gospelpath.org`
   - Click "Add"
   
3. **Copy DNS Settings**
   - Vercel will show you DNS records to add
   - Usually something like:
     - Type: `A`
     - Name: `@`
     - Value: `76.76.21.21`
     
     OR
     
     - Type: `CNAME`
     - Name: `www`
     - Value: `cname.vercel-dns.com`

### In Porkbun (or wherever you bought domain):

1. **Log in to Porkbun**
   - Go to: https://porkbun.com
   - Log in with your account

2. **Manage Domain**
   - Find `gospelpath.org`
   - Click "Manage"

3. **Update DNS Records**
   - Go to "DNS Records" section
   - Delete any existing A or CNAME records
   - Add the records Vercel gave you:
     - Add A record: `@` → `76.76.21.21`
     - Add CNAME record: `www` → `cname.vercel-dns.com`
   
4. **Save Changes**
   - Click "Save" or "Update"

5. **Wait for Propagation**
   - DNS changes take 10 minutes to 24 hours
   - Usually works within 1-2 hours
   - Vercel will show "Valid" when ready

6. **Test Your Domain**
   - Visit: https://gospelpath.org
   - Should show your Bible study assistant!
   - SSL certificate (https) is automatic from Vercel

---

## 🔄 **Step 5: Set Up gospeler.org Redirect**

Make gospeler.org point to gospelpath.org.

### In Vercel:

1. **Add Secondary Domain**
   - Go to Settings → Domains
   - Click "Add Domain"
   - Enter: `gospeler.org`
   - Click "Add"

2. **Set as Redirect**
   - Click "Edit" next to gospeler.org
   - Choose "Redirect to gospelpath.org"
   - Save

### In Porkbun:

1. **Manage gospeler.org**
   - Same process as above
   - Add DNS records pointing to Vercel

2. **Result**
   - gospeler.org → redirects to → gospelpath.org
   - Both domains secured with https

---

## ✅ **Step 6: Verify Everything Works**

### Testing Checklist:

- [ ] Visit https://gospelpath.org
- [ ] Chat works with Llama (Groq)
- [ ] Switch to Claude model
- [ ] Chat works with Claude
- [ ] Translations selector works
- [ ] No API key visible in browser (check Network tab in DevTools)
- [ ] https:// is working (padlock icon)
- [ ] gospeler.org redirects to gospelpath.org
- [ ] Mobile works (test on phone)

### Common Issues:

**"Server configuration error"**
- Check environment variables in Vercel
- Make sure both API keys are set correctly
- Redeploy if you just added them

**"Domain not working"**
- DNS can take up to 24 hours
- Check DNS propagation: https://dnschecker.org
- Make sure you added correct records in Porkbun

**"Claude not working but Groq works"**
- Check you added ANTHROPIC_API_KEY correctly
- Make sure you have credit in Anthropic account
- Check Anthropic dashboard for API errors

---

## 📊 **Step 7: Monitor Usage**

Keep an eye on your AI usage to avoid surprises.

### Groq Dashboard:
- Visit: https://console.groq.com
- View usage statistics
- You have 14,400 requests/day free

### Anthropic Dashboard:
- Visit: https://console.anthropic.com
- Go to Usage → Usage & Billing
- Watch your $5 credit
- Set up billing alerts (recommended)

---

## 🎓 **What You've Learned**

Congratulations! You've just built a production-ready AI application with:

✅ **Backend Development**
- Serverless functions
- Environment variables (secrets management)
- Multi-provider API abstraction
- Error handling

✅ **Frontend Development**
- API integration
- State management
- User interface controls
- Real-time updates

✅ **DevOps / Deployment**
- Git workflow
- Vercel deployment
- DNS configuration
- Domain management
- SSL certificates

✅ **AI Integration**
- Multiple AI providers
- Conversation memory
- Prompt engineering
- Cost management

---

## 🚀 **Next Steps**

Now that you're live, you can:

### Immediate:
- [ ] Share with friends for feedback
- [ ] Test different theological questions
- [ ] Compare Groq vs Claude quality
- [ ] Monitor usage and costs

### Phase 2 Features:
- [ ] User accounts (save study history)
- [ ] Study notes / journal
- [ ] Verse highlighting
- [ ] Share study sessions
- [ ] Daily devotional delivery
- [ ] Prayer journal integration

### Phase 3 (Growth):
- [ ] Premium tier (Claude for paying users)
- [ ] Mobile app
- [ ] Community features
- [ ] Study groups
- [ ] Email courses

---

## 📞 **Need Help?**

**Vercel Issues:**
- Docs: https://vercel.com/docs
- Support: help@vercel.com

**Anthropic Issues:**
- Docs: https://docs.anthropic.com
- Support: support@anthropic.com

**Groq Issues:**
- Docs: https://console.groq.com/docs
- Support: support@groq.com

**GitHub Issues:**
- Docs: https://docs.github.com

---

## 🙏 **Your Mission**

Remember: You're building this to **bring people closer to Christ** through deeper engagement with Scripture.

Every line of code, every feature, every deployment is in service of that mission.

**May this tool be a blessing to many! 🙏**

---

*"Your word is a lamp to my feet and a light to my path." - Psalm 119:105*

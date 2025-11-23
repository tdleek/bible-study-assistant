# 📋 GospelPath.org Deployment Checklist

Use this checklist to track your progress as you deploy!

---

## ✅ Pre-Deployment

- [ ] Downloaded all backend files
- [ ] Have GitHub account ready
- [ ] Have Groq API key (you already have this)
- [ ] Purchased gospelpath.org
- [ ] Purchased gospeler.org
- [ ] Read README.md
- [ ] Read DEPLOYMENT.md

---

## ✅ Get Claude API Key

- [ ] Go to https://console.anthropic.com
- [ ] Sign up / Log in
- [ ] Add payment method
- [ ] Create API key
- [ ] Save API key securely (paste it somewhere safe!)

---

## ✅ Update Your Repository

- [ ] Create `api` folder in your bible-study-assistant repo
- [ ] Copy `api/chat.js` into the `api` folder
- [ ] Copy `vercel.json` to root of repo
- [ ] Copy `.gitignore` to root of repo
- [ ] Copy `.env.local.template` to root (for reference only)
- [ ] Update your `index.html` with code from `frontend-updates.js`
- [ ] Commit all changes to GitHub
- [ ] Push to GitHub

---

## ✅ Deploy to Vercel

- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] Import your bible-study-assistant repository
- [ ] Add environment variable: `GROQ_API_KEY` = [your Groq key]
- [ ] Add environment variable: `ANTHROPIC_API_KEY` = [your Claude key]
- [ ] Click Deploy
- [ ] Wait for deployment to complete
- [ ] Test the Vercel URL (bible-study-assistant.vercel.app)

---

## ✅ Connect Domain (gospelpath.org)

### In Vercel:
- [ ] Go to Settings → Domains
- [ ] Add domain: gospelpath.org
- [ ] Copy the DNS records Vercel shows you

### In Porkbun:
- [ ] Log into Porkbun
- [ ] Go to gospelpath.org → Manage
- [ ] Go to DNS Records
- [ ] Delete existing A/CNAME records
- [ ] Add A record: `@` → `76.76.21.21` (or whatever Vercel shows)
- [ ] Add CNAME record: `www` → `cname.vercel-dns.com`
- [ ] Save changes
- [ ] Wait for DNS propagation (10 min - 24 hours)

---

## ✅ Setup gospeler.org Redirect

### In Vercel:
- [ ] Go to Settings → Domains
- [ ] Add domain: gospeler.org
- [ ] Set to redirect to gospelpath.org

### In Porkbun:
- [ ] Add same DNS records for gospeler.org
- [ ] Save changes

---

## ✅ Final Testing

- [ ] Visit https://gospelpath.org
- [ ] Chat works with Llama (Groq)
- [ ] Switch to Claude
- [ ] Chat works with Claude
- [ ] Translation selector works
- [ ] Check browser console for errors (F12)
- [ ] Verify API key is NOT visible in Network tab
- [ ] Test on mobile device
- [ ] gospeler.org redirects to gospelpath.org
- [ ] Both domains have https:// (padlock icon)

---

## ✅ Monitor Usage

- [ ] Check Groq dashboard: https://console.groq.com
- [ ] Check Claude dashboard: https://console.anthropic.com
- [ ] Set up billing alert in Anthropic (Settings → Billing)
- [ ] Bookmark both dashboards

---

## 🎉 Launch!

- [ ] Share with friends for feedback
- [ ] Share in your church/community
- [ ] Post on social media (if desired)
- [ ] Gather testimonies of how it helps people
- [ ] Plan Phase 2 features (user accounts, notes, etc.)

---

## 📝 Notes Section

Write down important info here:

**Your Vercel URL:**
_________________________________

**DNS Propagation Complete:**
Date: __________ Time: __________

**First User Feedback:**
_________________________________
_________________________________
_________________________________

**Ideas for Improvements:**
_________________________________
_________________________________
_________________________________

---

**Remember:** You're building this to bring people closer to Christ! 🙏

*"Let your light shine before others, that they may see your good deeds 
and glorify your Father in heaven." - Matthew 5:16*

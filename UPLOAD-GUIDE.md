# 📤 GitHub Upload Guide

## Exact File Structure for Upload

Your `bible-study-assistant` repository should look EXACTLY like this after upload:

```
bible-study-assistant/
├── index.html              ← REPLACE your old one with the NEW one
├── api/
│   └── chat.js            ← NEW FILE
├── vercel.json            ← NEW FILE
├── .gitignore             ← NEW FILE
└── .env.local.template    ← NEW FILE (reference only)
```

---

## Step-by-Step Upload Process

### **1. Backup Your Current Files (Optional)**

Before making changes, you might want to backup:
```bash
# In your bible-study-assistant folder
cp index.html index.html.backup
```

### **2. Create the api Folder**

**Windows (File Explorer):**
- Open your `bible-study-assistant` folder
- Right-click → New → Folder
- Name it: `api` (lowercase)

**Mac (Finder):**
- Open your `bible-study-assistant` folder  
- File → New Folder
- Name it: `api` (lowercase)

**Command Line:**
```bash
cd path/to/bible-study-assistant
mkdir api
```

### **3. Copy Files from Your Download**

From the extracted `gospelpath-complete` folder, copy:

**Into the `api` folder:**
- ✅ `chat.js`

**Into the root (same level as index.html):**
- ✅ `vercel.json`
- ✅ `.gitignore`
- ✅ `.env.local.template`

**REPLACE the old index.html:**
- ✅ Delete or rename your old `index.html`
- ✅ Copy the NEW `index.html` to root

### **4. Verify Your Structure**

**Check that you have:**
```bash
# Run this in your bible-study-assistant folder:
ls -la

# You should see:
# .gitignore
# .env.local.template
# index.html
# vercel.json
# api/ (folder)
```

**Check inside api folder:**
```bash
ls api/

# You should see:
# chat.js
```

### **5. Commit to Git**

```bash
# Make sure you're in bible-study-assistant folder
cd path/to/bible-study-assistant

# Check what's changed
git status

# Add all files
git add .

# Commit with descriptive message
git commit -m "Add backend API with Groq + Claude support and updated UI"

# Push to GitHub
git push origin main
```

**If you get a branch error, try:**
```bash
git push origin master
```

### **6. Verify on GitHub.com**

1. Go to: https://github.com/YOUR-USERNAME/bible-study-assistant
2. You should see:
   - ✅ `api/` folder (click it to see `chat.js` inside)
   - ✅ `index.html` (updated timestamp)
   - ✅ `vercel.json`
   - ✅ `.gitignore`
   - ✅ `.env.local.template`

---

## ⚠️ Important Notes

**DO commit these files:**
- ✅ `api/chat.js`
- ✅ `index.html`
- ✅ `vercel.json`
- ✅ `.gitignore`
- ✅ `.env.local.template`

**DON'T commit these files:**
- ❌ `.env.local` (if you create one with actual API keys)
- ❌ `node_modules/` (if it exists)
- ❌ `.vercel/` (created during deployment)

The `.gitignore` file automatically prevents these from being committed.

---

## 🆘 Troubleshooting

**"git: command not found"**
→ Install Git: https://git-scm.com/downloads

**"Permission denied"**
→ Configure Git:
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

**"Nothing to commit"**
→ Make sure files are in the right place:
```bash
git status
```

**Files not showing on GitHub**
→ Make sure you pushed:
```bash
git push origin main
```

**"Branch 'main' not found"**
→ Try 'master' instead:
```bash
git push origin master
```

---

## ✅ Next Step After Upload

Once files are on GitHub, you're ready for:
**→ Vercel Deployment** (see DEPLOYMENT.md)

The deployment process will:
1. Connect Vercel to your GitHub repository
2. Add your API keys as environment variables
3. Deploy your application
4. Connect to gospelpath.org

---

## 📞 Need Help?

If you get stuck:
1. Check the error message carefully
2. Make sure files are in correct locations
3. Verify you're in the right folder
4. Come back and ask me!

---

**Ready to upload? Follow the steps above!** 🚀

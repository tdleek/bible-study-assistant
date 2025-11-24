# GospelPath Full Bible Interlinear Implementation Roadmap

## 📋 Executive Summary

This roadmap outlines the complete implementation plan for adding full Bible interlinear (Hebrew/Greek word-by-word) support to GospelPath. The system will provide word-by-word original language text with transliterations, English glosses, and Strong's Concordance numbers for every verse in the Bible.

---

## 🎯 Project Goals

1. **Complete Coverage**: Every verse in the Bible accessible with interlinear data
2. **Instant Loading**: Popular verses pre-loaded for immediate display
3. **On-Demand Fetching**: Less common verses fetched from API as needed
4. **Offline Capability**: Caching system for previously viewed verses
5. **Educational Value**: Full Strong's definitions accessible for every word

---

## 📊 Data Scale

| Testament | Verses | Words (approx) | Data Size |
|-----------|--------|----------------|-----------|
| Old Testament (Hebrew) | 23,145 | ~305,000 | ~8-12 MB |
| New Testament (Greek) | 7,957 | ~138,000 | ~4-6 MB |
| **Total** | **31,102** | **~443,000** | **~12-18 MB** |

---

## 🏗️ Architecture Overview

### Three-Tier Approach

```
┌─────────────────────────────────────────────────────────┐
│                    TIER 1: PRE-LOADED                   │
│         100+ Popular Verses (Instant Access)            │
│  Genesis 1:1, John 3:16, Psalm 23, Romans 8:28, etc.   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    TIER 2: API FETCH                    │
│      On-Demand from External Sources (1-2 sec)          │
│    BibleHub Interlinear / Bolls.life / OpenGNT API     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    TIER 3: LOCAL CACHE                  │
│       Browser localStorage (Repeat Access = Instant)    │
│              Up to 500 cached verses                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Data Structure

### Interlinear Word Object
```javascript
{
  original: "בְּרֵאשִׁית",     // Hebrew/Greek script
  translit: "bereshit",        // Transliteration
  english: "In beginning",     // English gloss
  strongs: "H7225",            // Strong's number
  morph: "Prep|N-fs"           // Morphology (optional)
}
```

### Verse Object
```javascript
{
  reference: "Genesis 1:1",
  language: "Hebrew",
  words: [ /* array of word objects */ ],
  fullText: "In the beginning God created the heavens and the earth."
}
```

---

## 📅 Implementation Phases

### Phase 1: Expand Pre-loaded Database (Day 1)
**Time: 2-3 hours**

#### Tasks:
1. ✅ Current: 8 verses pre-loaded
2. 🎯 Target: 100+ popular verses
3. Add verses from these categories:
   - **Creation/Genesis**: Gen 1:1-5, 1:26-27, 2:7, 3:15
   - **Psalms**: 1:1-3, 19:1-4, 23:1-6, 46:1, 91:1-2, 119:105
   - **Proverbs**: 3:5-6, 22:6, 31:10
   - **Prophets**: Isaiah 7:14, 9:6, 40:31, 53:5-6, Jer 29:11
   - **Gospels**: Matt 5:3-12, 6:9-13, 28:19-20, John 1:1-5, 1:14, 3:16-17, 14:6
   - **Epistles**: Rom 3:23, 5:8, 6:23, 8:1, 8:28, 10:9-10, 12:1-2
   - **Revelation**: 3:20, 21:4, 22:13

#### Data Sources:
- BibleHub Interlinear (manual extraction)
- OpenGNT GitHub repo (Greek NT)
- Open Scriptures Hebrew Bible

---

### Phase 2: Build API Endpoint (Day 1-2)
**Time: 2-3 hours**

#### Create `/api/interlinear.js` for Vercel:

```javascript
// Endpoint: /api/interlinear?book=Genesis&chapter=1&verse=1

export default async function handler(req, res) {
  const { book, chapter, verse } = req.query;
  
  // 1. Check pre-loaded database first
  // 2. If not found, fetch from external API
  // 3. Parse and format response
  // 4. Return standardized interlinear data
}
```

#### External API Options:
1. **Bolls.life API** (Free, no key required)
   - Has Hebrew (WLC) and Greek texts
   - Strong's dictionary lookup
   - URL: `https://bolls.life/get-text/{translation}/{book}/{chapter}/`

2. **API.Bible** (Free tier available)
   - Multiple interlinear versions
   - Requires API key
   - Good documentation

3. **BibleHub Scraping** (Fallback)
   - Most complete interlinear data
   - Requires HTML parsing
   - Rate-limit considerations

---

### Phase 3: Frontend Integration (Day 2)
**Time: 1-2 hours**

#### Update `index.html`:

1. **Modify `getInterlinearData()` function**:
```javascript
async getInterlinearData() {
  // Check pre-loaded first
  if (INTERLINEAR_DATABASE[this.currentVerse]) {
    return INTERLINEAR_DATABASE[this.currentVerse];
  }
  
  // Check localStorage cache
  const cached = localStorage.getItem(`interlinear_${this.currentVerse}`);
  if (cached) return JSON.parse(cached);
  
  // Fetch from API
  this.loadingInterlinear = true;
  const data = await fetch(`/api/interlinear?ref=${encodeURIComponent(this.currentVerse)}`);
  const result = await data.json();
  
  // Cache for future use
  localStorage.setItem(`interlinear_${this.currentVerse}`, JSON.stringify(result));
  
  this.loadingInterlinear = false;
  return result;
}
```

2. **Add loading state UI**:
```html
<div x-show="loadingInterlinear" class="text-center py-4">
  <div class="animate-spin ...">Loading interlinear data...</div>
</div>
```

3. **Update `hasInterlinear()` to always return true** (since API provides full coverage)

---

### Phase 4: Caching System (Day 2-3)
**Time: 1 hour**

#### LocalStorage Cache Manager:
```javascript
const InterlinearCache = {
  maxItems: 500,
  
  get(reference) {
    return JSON.parse(localStorage.getItem(`il_${reference}`) || 'null');
  },
  
  set(reference, data) {
    // Implement LRU eviction if over limit
    this.evictIfNeeded();
    localStorage.setItem(`il_${reference}`, JSON.stringify(data));
    this.updateAccessTime(reference);
  },
  
  evictIfNeeded() {
    const keys = this.getAllKeys();
    if (keys.length >= this.maxItems) {
      // Remove oldest accessed items
      const oldest = this.getOldestKeys(50);
      oldest.forEach(key => localStorage.removeItem(key));
    }
  }
};
```

---

### Phase 5: Strong's Dictionary Expansion (Day 3)
**Time: 2-3 hours**

#### Current State:
- 16 Strong's definitions in database
- Modal shows definitions for known words

#### Target:
- Complete Hebrew lexicon (~8,674 entries)
- Complete Greek lexicon (~5,624 entries)
- Total: ~14,298 definitions

#### Implementation Options:

**Option A: API Lookup (Recommended)**
```javascript
async getStrongsDefinition(strongsNumber) {
  // Try local first
  if (STRONGS_DATABASE[strongsNumber]) {
    return STRONGS_DATABASE[strongsNumber];
  }
  
  // Fetch from Bolls.life dictionary API
  const response = await fetch(
    `https://bolls.life/dictionary-definition/BDBT/${strongsNumber}`
  );
  return await response.json();
}
```

**Option B: Bundled JSON** (Offline capable)
- Download complete Strong's dictionaries
- Bundle as JSON (~2MB compressed)
- Load on first use

---

### Phase 6: Testing & Optimization (Day 3-4)
**Time: 2-3 hours**

#### Test Cases:
1. ✓ Pre-loaded verses load instantly
2. ✓ API verses fetch correctly
3. ✓ Cache stores and retrieves properly
4. ✓ Strong's modals work for all words
5. ✓ Hebrew RTL display correct
6. ✓ Greek diacritics display correctly
7. ✓ Mobile responsive layout
8. ✓ Error handling for API failures

#### Performance Targets:
- Pre-loaded verses: < 100ms
- API fetch: < 2 seconds
- Cached verses: < 100ms

---

## 📂 File Structure

```
gospelpath/
├── index.html                    # Main app (with INTERLINEAR_DATABASE)
├── api/
│   ├── chat.js                   # AI chat endpoint
│   ├── interlinear.js            # NEW: Interlinear fetch endpoint
│   └── strongs.js                # NEW: Strong's dictionary endpoint
├── data/
│   ├── interlinear-preload.json  # 100+ popular verses
│   └── strongs-common.json       # Most common Strong's entries
└── vercel.json                   # Vercel configuration
```

---

## 🔗 Data Sources & Attribution

### Hebrew Bible
- **Open Scriptures Hebrew Bible** (morphhb)
  - License: CC BY 4.0
  - GitHub: github.com/openscriptures/morphhb
  - Contains: WLC text with Strong's numbers

### Greek New Testament
- **OpenGNT Project**
  - License: CC BY-SA 4.0
  - GitHub: github.com/eliranwong/OpenGNT
  - Contains: NA28 equivalent with Strong's numbers

### Interlinear Data
- **tahmmee/interlinear_bibledata**
  - License: Public Domain
  - GitHub: github.com/tahmmee/interlinear_bibledata
  - Contains: Both OT and NT with Strong's

### Strong's Concordance
- **Bolls.life Dictionary API**
  - Free API, no key required
  - Contains: Brown-Driver-Briggs Hebrew, Thayer's Greek

### Attribution Required:
```html
<footer>
  Interlinear data from Open Scriptures Hebrew Bible and OpenGNT.
  Strong's definitions from Brown-Driver-Briggs and Thayer's Lexicons.
</footer>
```

---

## ⏱️ Time Estimates

| Phase | Task | Time |
|-------|------|------|
| 1 | Expand pre-loaded verses | 2-3 hours |
| 2 | Build API endpoint | 2-3 hours |
| 3 | Frontend integration | 1-2 hours |
| 4 | Caching system | 1 hour |
| 5 | Strong's expansion | 2-3 hours |
| 6 | Testing & optimization | 2-3 hours |
| **Total** | | **10-15 hours** |

---

## 🚀 Quick Start Commands

### Clone Interlinear Data (when network available):
```bash
git clone https://github.com/tahmmee/interlinear_bibledata.git
cd interlinear_bibledata/interlinear
tar -xzf bible.tar.gz
```

### Test Bolls.life API:
```bash
# Get Genesis 1 in Hebrew (WLC)
curl "https://bolls.life/get-text/WLC/1/1/"

# Get Strong's definition
curl "https://bolls.life/dictionary-definition/BDBT/H7225"
```

### Deploy to Vercel:
```bash
cd gospelpath
vercel --prod
```

---

## 📝 Notes & Considerations

### Known Issues:
- 1 Kings 22 and 3 John 15 missing from tahmmee data
- Some Hebrew words have multiple Strong's numbers
- Morphology codes vary between sources

### Future Enhancements:
- [ ] Verse audio pronunciation
- [ ] Word frequency statistics
- [ ] Cross-reference links
- [ ] Parsing breakdown view
- [ ] Morphology explanation tooltips
- [ ] Export interlinear as PDF/image

### Mobile Considerations:
- Interlinear grid may need horizontal scroll on narrow screens
- Touch targets should be at least 44px for word selection
- Consider collapsible interlinear for space efficiency

---

## ✅ Checklist

- [ ] Phase 1: Add 100+ pre-loaded verses
- [ ] Phase 2: Create `/api/interlinear.js`
- [ ] Phase 3: Update frontend with API integration
- [ ] Phase 4: Implement caching system
- [ ] Phase 5: Expand Strong's database
- [ ] Phase 6: Test all features
- [ ] Deploy and verify production

---

*Last Updated: November 2025*
*GospelPath Bible Study Assistant*

/**
 * GospelPath Verse API Endpoint
 * 
 * Fetches verse text in various English translations from Bolls.life API.
 * 
 * Usage: /api/verse?ref=Genesis%201:1&translation=ESV
 */

// Book name to number mapping
const BOOK_MAP = {
  'genesis': 1, 'gen': 1, 'exodus': 2, 'exod': 2, 'ex': 2,
  'leviticus': 3, 'lev': 3, 'numbers': 4, 'num': 4,
  'deuteronomy': 5, 'deut': 5, 'dt': 5, 'joshua': 6, 'josh': 6,
  'judges': 7, 'judg': 7, 'ruth': 8,
  '1 samuel': 9, '1samuel': 9, '1sam': 9, '2 samuel': 10, '2samuel': 10, '2sam': 10,
  '1 kings': 11, '1kings': 11, '1kgs': 11, '2 kings': 12, '2kings': 12, '2kgs': 12,
  '1 chronicles': 13, '1chronicles': 13, '1chr': 13,
  '2 chronicles': 14, '2chronicles': 14, '2chr': 14,
  'ezra': 15, 'nehemiah': 16, 'neh': 16, 'esther': 17, 'esth': 17, 'job': 18,
  'psalms': 19, 'psalm': 19, 'ps': 19, 'psa': 19,
  'proverbs': 20, 'prov': 20, 'pr': 20,
  'ecclesiastes': 21, 'eccl': 21, 'ecc': 21,
  'song of solomon': 22, 'song': 22, 'sos': 22,
  'isaiah': 23, 'isa': 23, 'jeremiah': 24, 'jer': 24,
  'lamentations': 25, 'lam': 25, 'ezekiel': 26, 'ezek': 26,
  'daniel': 27, 'dan': 27, 'hosea': 28, 'hos': 28, 'joel': 29,
  'amos': 30, 'obadiah': 31, 'obad': 31, 'jonah': 32, 'jon': 32,
  'micah': 33, 'mic': 33, 'nahum': 34, 'nah': 34, 'habakkuk': 35, 'hab': 35,
  'zephaniah': 36, 'zeph': 36, 'haggai': 37, 'hag': 37,
  'zechariah': 38, 'zech': 38, 'malachi': 39, 'mal': 39,
  'matthew': 40, 'matt': 40, 'mt': 40, 'mark': 41, 'mk': 41,
  'luke': 42, 'lk': 42, 'john': 43, 'jn': 43, 'acts': 44,
  'romans': 45, 'rom': 45,
  '1 corinthians': 46, '1corinthians': 46, '1cor': 46,
  '2 corinthians': 47, '2corinthians': 47, '2cor': 47,
  'galatians': 48, 'gal': 48, 'ephesians': 49, 'eph': 49,
  'philippians': 50, 'phil': 50, 'colossians': 51, 'col': 51,
  '1 thessalonians': 52, '1thessalonians': 52, '1thess': 52,
  '2 thessalonians': 53, '2thessalonians': 53, '2thess': 53,
  '1 timothy': 54, '1timothy': 54, '1tim': 54,
  '2 timothy': 55, '2timothy': 55, '2tim': 55,
  'titus': 56, 'tit': 56, 'philemon': 57, 'phlm': 57,
  'hebrews': 58, 'heb': 58, 'james': 59, 'jas': 59,
  '1 peter': 60, '1peter': 60, '1pet': 60, '2 peter': 61, '2peter': 61, '2pet': 61,
  '1 john': 62, '1john': 62, '1jn': 62, '2 john': 63, '2john': 63, '2jn': 63,
  '3 john': 64, '3john': 64, '3jn': 64, 'jude': 65,
  'revelation': 66, 'rev': 66
};

// Book number to display name
const BOOK_NAMES = {
  1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy',
  6: 'Joshua', 7: 'Judges', 8: 'Ruth', 9: '1 Samuel', 10: '2 Samuel',
  11: '1 Kings', 12: '2 Kings', 13: '1 Chronicles', 14: '2 Chronicles',
  15: 'Ezra', 16: 'Nehemiah', 17: 'Esther', 18: 'Job', 19: 'Psalm',
  20: 'Proverbs', 21: 'Ecclesiastes', 22: 'Song of Solomon', 23: 'Isaiah',
  24: 'Jeremiah', 25: 'Lamentations', 26: 'Ezekiel', 27: 'Daniel',
  28: 'Hosea', 29: 'Joel', 30: 'Amos', 31: 'Obadiah', 32: 'Jonah',
  33: 'Micah', 34: 'Nahum', 35: 'Habakkuk', 36: 'Zephaniah', 37: 'Haggai',
  38: 'Zechariah', 39: 'Malachi', 40: 'Matthew', 41: 'Mark', 42: 'Luke',
  43: 'John', 44: 'Acts', 45: 'Romans', 46: '1 Corinthians', 47: '2 Corinthians',
  48: 'Galatians', 49: 'Ephesians', 50: 'Philippians', 51: 'Colossians',
  52: '1 Thessalonians', 53: '2 Thessalonians', 54: '1 Timothy', 55: '2 Timothy',
  56: 'Titus', 57: 'Philemon', 58: 'Hebrews', 59: 'James', 60: '1 Peter',
  61: '2 Peter', 62: '1 John', 63: '2 John', 64: '3 John', 65: 'Jude',
  66: 'Revelation'
};

// Translation mapping for Bolls.life
const TRANSLATION_MAP = {
  'ESV': 'ESV',
  'NIV': 'NIV',
  'KJV': 'KJV',
  'NKJV': 'NKJV',
  'NASB': 'NASB',
  'NLT': 'NLT',
  'CSB': 'CSB17',
  'MSG': 'MSG',
  'AMP': 'AMP',
  'NRSV': 'NRSVCE',
  'WEB': 'WEB',
  'YLT': 'YLT'
};

function parseReference(ref) {
  const match = ref.match(/^(\d?\s*\w+)\s+(\d+):(\d+)(?:-(\d+))?$/i);
  if (!match) return null;
  
  const bookName = match[1].toLowerCase().trim();
  const chapter = parseInt(match[2]);
  const verseStart = parseInt(match[3]);
  const verseEnd = match[4] ? parseInt(match[4]) : verseStart;
  
  const bookNum = BOOK_MAP[bookName];
  if (!bookNum) return null;
  
  return { bookNum, chapter, verseStart, verseEnd, bookName: match[1] };
}

// Main handler
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { ref, translation = 'ESV' } = req.query;
    
    if (!ref) {
      return res.status(400).json({ 
        error: 'Missing ref parameter', 
        usage: '/api/verse?ref=Genesis%201:1&translation=ESV'
      });
    }
    
    const parsed = parseReference(ref);
    if (!parsed) {
      return res.status(400).json({ 
        error: 'Invalid reference format',
        received: ref
      });
    }
    
    const bookName = BOOK_NAMES[parsed.bookNum];
    const referenceKey = `${bookName} ${parsed.chapter}:${parsed.verseStart}`;
    const bollsTranslation = TRANSLATION_MAP[translation.toUpperCase()] || 'ESV';
    
    // Fetch from Bolls.life
    const url = `https://bolls.life/get-text/${bollsTranslation}/${parsed.bookNum}/${parsed.chapter}/`;
    console.log('Fetching verse from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(404).json({ 
        error: 'Verse not found',
        reference: referenceKey
      });
    }
    
    const chapterData = await response.json();
    
    // Find the specific verse(s)
    let verseText = '';
    for (let v = parsed.verseStart; v <= parsed.verseEnd; v++) {
      const verseData = chapterData.find(verse => verse.verse === v);
      if (verseData && verseData.text) {
        // Clean HTML tags from text
        const cleanText = verseData.text.replace(/<[^>]*>/g, '').trim();
        verseText += (verseText ? ' ' : '') + cleanText;
      }
    }
    
    if (!verseText) {
      return res.status(404).json({ 
        error: 'Verse not found in chapter',
        reference: referenceKey
      });
    }
    
    return res.status(200).json({
      reference: referenceKey,
      translation: translation.toUpperCase(),
      text: verseText,
      bookNum: parsed.bookNum,
      chapter: parsed.chapter,
      verse: parsed.verseStart
    });
    
  } catch (error) {
    console.error('Verse API error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
}

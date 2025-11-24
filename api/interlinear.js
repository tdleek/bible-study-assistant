/**
 * GospelPath Interlinear API Endpoint
 * 
 * Fetches word-by-word Hebrew/Greek interlinear data for any Bible verse.
 * Uses Bolls.life API with WLCa (Hebrew) and TISCH (Greek) translations.
 * 
 * Usage: /api/interlinear?ref=Genesis%201:1
 * Debug: /api/interlinear?ref=Mark%201:1&debug=true
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

function getLanguage(bookNum) {
  return bookNum <= 39 ? 'Hebrew' : 'Greek';
}

function parseReference(ref) {
  const match = ref.match(/^(\d?\s*\w+)\s+(\d+):(\d+)(?:-(\d+))?$/i);
  if (!match) return null;
  
  const bookName = match[1].toLowerCase().trim();
  const chapter = parseInt(match[2]);
  const verseStart = parseInt(match[3]);
  
  const bookNum = BOOK_MAP[bookName];
  if (!bookNum) return null;
  
  return { bookNum, chapter, verseStart, bookName: match[1] };
}

// Simple transliteration for Hebrew
function transliterateHebrew(text) {
  if (!text) return '';
  const map = {
    'א': "'", 'ב': 'v', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
    'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm', 'ם': 'm',
    'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': "'", 'פ': 'f', 'ף': 'f', 'צ': 'ts', 'ץ': 'ts',
    'ק': 'q', 'ר': 'r', 'ש': 'sh', 'ת': 't'
  };
  // Remove vowel points and accents
  let clean = text.replace(/[\u0591-\u05C7]/g, '');
  return clean.split('').map(c => map[c] || c).join('');
}

// Simple transliteration for Greek
function transliterateGreek(text) {
  if (!text) return '';
  const map = {
    'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'e',
    'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o',
    'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'u', 'φ': 'ph', 'χ': 'ch',
    'ψ': 'ps', 'ω': 'o',
    // Extended Greek characters
    'ά': 'a', 'έ': 'e', 'ή': 'e', 'ί': 'i', 'ό': 'o', 'ύ': 'u', 'ώ': 'o',
    'ἀ': 'a', 'ἁ': 'ha', 'ἐ': 'e', 'ἑ': 'he', 'ἠ': 'e', 'ἡ': 'he',
    'ἰ': 'i', 'ἱ': 'hi', 'ὀ': 'o', 'ὁ': 'ho', 'ὐ': 'u', 'ὑ': 'hu',
    'ὠ': 'o', 'ὡ': 'ho'
  };
  return text.toLowerCase().split('').map(c => map[c] || c).join('');
}

function transliterate(text, language) {
  return language === 'Hebrew' ? transliterateHebrew(text) : transliterateGreek(text);
}

// Fetch chapter from Bolls.life and extract verse
async function fetchFromBolls(bookNum, chapter, verse, language) {
  try {
    // Bolls.life translations WITH Strong's numbers:
    // WLCa = Westminster Leningrad Codex (with vowels, accents and Strong's numbers) - Hebrew
    // TISCH = Tischendorf's Greek NT 8th ed (With Strong's numbers) - Greek
    const translation = language === 'Hebrew' ? 'WLCa' : 'TISCH';
    
    // Fetch the whole chapter
    const url = `https://bolls.life/get-chapter/${translation}/${bookNum}/${chapter}/`;
    console.log('🔍 Fetching from Bolls:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`❌ Bolls returned HTTP ${response.status}`);
      return null;
    }
    
    const chapterData = await response.json();
    console.log(`📖 Got ${chapterData.length} verses in chapter`);
    
    // Find the specific verse
    const verseData = chapterData.find(v => v.verse === verse);
    
    if (!verseData || !verseData.text) {
      console.log('❌ Verse not found in chapter data');
      return null;
    }
    
    console.log('📝 Raw verse text:', verseData.text.substring(0, 200) + '...');
    
    // Parse the interlinear text
    const words = parseInterlinearText(verseData.text, language);
    console.log(`✅ Parsed ${words.length} words`);
    
    return {
      words,
      rawText: verseData.text, // Include for debugging
      fullText: verseData.text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    };
    
  } catch (error) {
    console.error('❌ Bolls fetch error:', error.message);
    return null;
  }
}

// Parse interlinear text with Strong's numbers
// Handles multiple formats from different Bible data sources
function parseInterlinearText(html, language) {
  const words = [];
  
  // STRATEGY: Try multiple parsing approaches
  
  // ========================================
  // APPROACH 1: Direct word+Strong's pattern
  // Format: בראשׁיתH7225 or βιβλοςG976
  // ========================================
  const directPattern = language === 'Hebrew'
    ? /([\u0590-\u05FF\uFB1D-\uFB4F]+)(H\d+)/gi
    : /([\u0370-\u03FF\u1F00-\u1FFF]+)(G\d+)/gi;
  
  let directMatches = [...html.matchAll(directPattern)];
  
  if (directMatches.length > 0) {
    console.log('📌 Using direct word+Strong pattern');
    for (const match of directMatches) {
      words.push({
        original: match[1],
        translit: transliterate(match[1], language),
        english: '',
        strongs: match[2].toUpperCase()
      });
    }
    return words;
  }
  
  // ========================================
  // APPROACH 2: HTML tag patterns
  // Format: word<S>1696</S> (numbers only, no H/G prefix)
  // ========================================
  
  // Try <S>number</S> pattern first (most common in Bolls WLCa/TISCH)
  const strongsTagPattern = /<[sS]>(\d+)<\/[sS]>/g;
  const tagMatches = [...html.matchAll(strongsTagPattern)];
  
  if (tagMatches.length > 0) {
    console.log(`📌 Found ${tagMatches.length} Strong's tags`);
    
    // Split by the FULL tag (not just the pattern) to get segments
    const splitPattern = /<[sS]>\d+<\/[sS]>/g;
    const segments = html.split(splitPattern);
    
    for (let i = 0; i < tagMatches.length; i++) {
      let strongsNum = tagMatches[i][1];
      // Add H or G prefix
      strongsNum = (language === 'Hebrew' ? 'H' : 'G') + strongsNum;
      
      const segment = segments[i] || '';
      
      // Extract the Hebrew/Greek word from the segment (last word before the tag)
      let originalWord = '';
      if (language === 'Hebrew') {
        const hebrewMatch = segment.match(/[\u0590-\u05FF\uFB1D-\uFB4F]+/g);
        if (hebrewMatch) originalWord = hebrewMatch[hebrewMatch.length - 1];
      } else {
        const greekMatch = segment.match(/[\u0370-\u03FF\u1F00-\u1FFF]+/g);
        if (greekMatch) originalWord = greekMatch[greekMatch.length - 1];
      }
      
      if (originalWord) {
        words.push({
          original: originalWord,
          translit: transliterate(originalWord, language),
          english: '',
          strongs: strongsNum
        });
      }
    }
    
    if (words.length > 0) return words;
  }
  
  // ========================================
  // APPROACH 3: Fallback - just extract words
  // No Strong's numbers available
  // ========================================
  console.log('📌 Fallback: extracting words without Strong\'s');
  
  const wordPattern = language === 'Hebrew' 
    ? /[\u0590-\u05FF\uFB1D-\uFB4F]+/g
    : /[\u0370-\u03FF\u1F00-\u1FFF]+/g;
  
  const wordMatches = html.match(wordPattern);
  if (wordMatches) {
    wordMatches.forEach(word => {
      words.push({
        original: word,
        translit: transliterate(word, language),
        english: '',
        strongs: ''
      });
    });
  }
  
  return words;
}

// Fetch Strong's definitions to get English glosses
async function enrichWithStrongs(words) {
  const enriched = [...words];
  
  for (let i = 0; i < enriched.length; i++) {
    const word = enriched[i];
    if (word.strongs && !word.english) {
      try {
        const url = `https://bolls.life/dictionary-definition/BDBT/${word.strongs}/`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data[0]) {
            // Get short definition, clean it up
            const def = data[0].short_definition || data[0].definition || '';
            // Take first part, clean HTML, limit length
            word.english = def
              .replace(/<[^>]*>/g, '')
              .split(/[,;]/)[0]
              .trim()
              .substring(0, 25);
          }
        }
      } catch (e) {
        // Skip failed lookups silently
      }
    }
  }
  
  return enriched;
}

// Pre-loaded popular verses for instant access
const PRELOADED = {
  'Genesis 1:1': {
    language: 'Hebrew',
    words: [
      { original: 'בְּרֵאשִׁית', translit: 'bereshit', english: 'In the beginning', strongs: 'H7225' },
      { original: 'בָּרָא', translit: 'bara', english: 'created', strongs: 'H1254' },
      { original: 'אֱלֹהִים', translit: 'elohim', english: 'God', strongs: 'H430' },
      { original: 'אֵת', translit: 'et', english: '[obj]', strongs: 'H853' },
      { original: 'הַשָּׁמַיִם', translit: 'hashamayim', english: 'the heavens', strongs: 'H8064' },
      { original: 'וְאֵת', translit: "ve'et", english: 'and', strongs: 'H853' },
      { original: 'הָאָרֶץ', translit: "ha'aretz", english: 'the earth', strongs: 'H776' }
    ],
    fullText: 'In the beginning God created the heavens and the earth.'
  },
  'John 3:16': {
    language: 'Greek',
    words: [
      { original: 'Οὕτως', translit: 'houtos', english: 'thus', strongs: 'G3779' },
      { original: 'γὰρ', translit: 'gar', english: 'for', strongs: 'G1063' },
      { original: 'ἠγάπησεν', translit: 'egapesen', english: 'loved', strongs: 'G25' },
      { original: 'ὁ', translit: 'ho', english: 'the', strongs: 'G3588' },
      { original: 'Θεὸς', translit: 'theos', english: 'God', strongs: 'G2316' },
      { original: 'τὸν', translit: 'ton', english: 'the', strongs: 'G3588' },
      { original: 'κόσμον', translit: 'kosmon', english: 'world', strongs: 'G2889' }
    ],
    fullText: 'For God so loved the world that he gave his only Son.'
  },
  'Psalm 23:1': {
    language: 'Hebrew',
    words: [
      { original: 'יְהוָה', translit: 'YHWH', english: 'The LORD', strongs: 'H3068' },
      { original: 'רֹעִי', translit: "ro'i", english: 'my shepherd', strongs: 'H7462' },
      { original: 'לֹא', translit: 'lo', english: 'not', strongs: 'H3808' },
      { original: 'אֶחְסָר', translit: 'echsar', english: 'I shall want', strongs: 'H2637' }
    ],
    fullText: 'The LORD is my shepherd; I shall not want.'
  },
  'Mark 1:1': {
    language: 'Greek',
    words: [
      { original: 'Ἀρχὴ', translit: 'arche', english: 'beginning', strongs: 'G746' },
      { original: 'τοῦ', translit: 'tou', english: 'of the', strongs: 'G3588' },
      { original: 'εὐαγγελίου', translit: 'euangeliou', english: 'gospel', strongs: 'G2098' },
      { original: 'Ἰησοῦ', translit: 'Iesou', english: 'of Jesus', strongs: 'G2424' },
      { original: 'Χριστοῦ', translit: 'Christou', english: 'Christ', strongs: 'G5547' },
      { original: 'υἱοῦ', translit: 'huiou', english: 'Son', strongs: 'G5207' },
      { original: 'Θεοῦ', translit: 'Theou', english: 'of God', strongs: 'G2316' }
    ],
    fullText: 'The beginning of the gospel of Jesus Christ, the Son of God.'
  },
  'Romans 8:28': {
    language: 'Greek',
    words: [
      { original: 'οἴδαμεν', translit: 'oidamen', english: 'we know', strongs: 'G1492' },
      { original: 'ὅτι', translit: 'hoti', english: 'that', strongs: 'G3754' },
      { original: 'πάντα', translit: 'panta', english: 'all things', strongs: 'G3956' },
      { original: 'συνεργεῖ', translit: 'sunergei', english: 'work together', strongs: 'G4903' },
      { original: 'εἰς', translit: 'eis', english: 'for', strongs: 'G1519' },
      { original: 'ἀγαθόν', translit: 'agathon', english: 'good', strongs: 'G18' }
    ],
    fullText: 'And we know that all things work together for good.'
  }
};

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
    const { ref, debug } = req.query;
    
    if (!ref) {
      return res.status(400).json({ 
        error: 'Missing ref parameter', 
        usage: '/api/interlinear?ref=Genesis%201:1',
        examples: ['Genesis 1:1', 'John 3:16', 'Psalm 23:1', 'Mark 1:1']
      });
    }
    
    const parsed = parseReference(ref);
    if (!parsed) {
      return res.status(400).json({ 
        error: 'Invalid reference format',
        received: ref,
        expected: 'Book Chapter:Verse (e.g., Genesis 1:1, John 3:16)'
      });
    }
    
    const bookName = BOOK_NAMES[parsed.bookNum];
    const referenceKey = `${bookName} ${parsed.chapter}:${parsed.verseStart}`;
    const language = getLanguage(parsed.bookNum);
    
    console.log(`\n========== INTERLINEAR REQUEST ==========`);
    console.log(`Reference: ${referenceKey}`);
    console.log(`Language: ${language}`);
    console.log(`Book #: ${parsed.bookNum}, Chapter: ${parsed.chapter}, Verse: ${parsed.verseStart}`);
    
    // Check preloaded first
    if (PRELOADED[referenceKey]) {
      console.log('✅ Returning preloaded data');
      return res.status(200).json({
        reference: referenceKey,
        source: 'preloaded',
        ...PRELOADED[referenceKey]
      });
    }
    
    // Fetch from Bolls.life API
    console.log('🌐 Fetching from Bolls.life API...');
    const data = await fetchFromBolls(parsed.bookNum, parsed.chapter, parsed.verseStart, language);
    
    if (data && data.words && data.words.length > 0) {
      // Enrich with Strong's definitions
      console.log('📚 Enriching with Strong\'s definitions...');
      const enrichedWords = await enrichWithStrongs(data.words);
      
      const response = {
        reference: referenceKey,
        source: 'bolls',
        language: language,
        words: enrichedWords,
        fullText: data.fullText
      };
      
      // Include raw text in debug mode
      if (debug === 'true') {
        response.debug = {
          rawText: data.rawText,
          wordsBeforeEnrich: data.words
        };
      }
      
      console.log('✅ Returning API data');
      return res.status(200).json(response);
    }
    
    // Fallback - API didn't return usable data
    console.log('⚠️ No data from API, returning fallback');
    return res.status(200).json({
      reference: referenceKey,
      source: 'api',
      language: language,
      available: false,
      message: `Interlinear data not available for ${referenceKey}. Try: Genesis 1:1, John 3:16, Psalm 23:1, Mark 1:1`,
      debug: debug === 'true' ? { rawData: data } : undefined
    });
    
  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message 
    });
  }
}

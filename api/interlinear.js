/**
 * GospelPath Interlinear API Endpoint
 * 
 * Fetches word-by-word Hebrew/Greek interlinear data for any Bible verse.
 * 
 * Usage: /api/interlinear?book=Genesis&chapter=1&verse=1
 * Or:    /api/interlinear?ref=Genesis%201:1
 * 
 * Returns: {
 *   reference: "Genesis 1:1",
 *   language: "Hebrew",
 *   words: [{ original, translit, english, strongs }],
 *   fullText: "In the beginning..."
 * }
 */

// Book name to number mapping (for API calls)
const BOOK_MAP = {
  // Old Testament
  'genesis': 1, 'gen': 1,
  'exodus': 2, 'exod': 2, 'ex': 2,
  'leviticus': 3, 'lev': 3,
  'numbers': 4, 'num': 4,
  'deuteronomy': 5, 'deut': 5, 'dt': 5,
  'joshua': 6, 'josh': 6,
  'judges': 7, 'judg': 7,
  'ruth': 8,
  '1 samuel': 9, '1samuel': 9, '1sam': 9,
  '2 samuel': 10, '2samuel': 10, '2sam': 10,
  '1 kings': 11, '1kings': 11, '1kgs': 11,
  '2 kings': 12, '2kings': 12, '2kgs': 12,
  '1 chronicles': 13, '1chronicles': 13, '1chr': 13,
  '2 chronicles': 14, '2chronicles': 14, '2chr': 14,
  'ezra': 15,
  'nehemiah': 16, 'neh': 16,
  'esther': 17, 'esth': 17,
  'job': 18,
  'psalms': 19, 'psalm': 19, 'ps': 19, 'psa': 19,
  'proverbs': 20, 'prov': 20, 'pr': 20,
  'ecclesiastes': 21, 'eccl': 21, 'ecc': 21,
  'song of solomon': 22, 'song': 22, 'sos': 22, 'canticles': 22,
  'isaiah': 23, 'isa': 23,
  'jeremiah': 24, 'jer': 24,
  'lamentations': 25, 'lam': 25,
  'ezekiel': 26, 'ezek': 26, 'eze': 26,
  'daniel': 27, 'dan': 27,
  'hosea': 28, 'hos': 28,
  'joel': 29,
  'amos': 30,
  'obadiah': 31, 'obad': 31,
  'jonah': 32, 'jon': 32,
  'micah': 33, 'mic': 33,
  'nahum': 34, 'nah': 34,
  'habakkuk': 35, 'hab': 35,
  'zephaniah': 36, 'zeph': 36,
  'haggai': 37, 'hag': 37,
  'zechariah': 38, 'zech': 38,
  'malachi': 39, 'mal': 39,
  // New Testament
  'matthew': 40, 'matt': 40, 'mt': 40,
  'mark': 41, 'mk': 41,
  'luke': 42, 'lk': 42,
  'john': 43, 'jn': 43,
  'acts': 44,
  'romans': 45, 'rom': 45,
  '1 corinthians': 46, '1corinthians': 46, '1cor': 46,
  '2 corinthians': 47, '2corinthians': 47, '2cor': 47,
  'galatians': 48, 'gal': 48,
  'ephesians': 49, 'eph': 49,
  'philippians': 50, 'phil': 50,
  'colossians': 51, 'col': 51,
  '1 thessalonians': 52, '1thessalonians': 52, '1thess': 52,
  '2 thessalonians': 53, '2thessalonians': 53, '2thess': 53,
  '1 timothy': 54, '1timothy': 54, '1tim': 54,
  '2 timothy': 55, '2timothy': 55, '2tim': 55,
  'titus': 56, 'tit': 56,
  'philemon': 57, 'phlm': 57,
  'hebrews': 58, 'heb': 58,
  'james': 59, 'jas': 59,
  '1 peter': 60, '1peter': 60, '1pet': 60,
  '2 peter': 61, '2peter': 61, '2pet': 61,
  '1 john': 62, '1john': 62, '1jn': 62,
  '2 john': 63, '2john': 63, '2jn': 63,
  '3 john': 64, '3john': 64, '3jn': 64,
  'jude': 65,
  'revelation': 66, 'rev': 66, 'apocalypse': 66
};

// Determine if book is OT (Hebrew) or NT (Greek)
function getLanguage(bookNum) {
  return bookNum <= 39 ? 'Hebrew' : 'Greek';
}

// Parse reference string like "Genesis 1:1" or "John 3:16"
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

// Transliteration maps for Hebrew and Greek
const HEBREW_TRANSLIT = {
  'א': "'", 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h',
  'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y',
  'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm', 'ם': 'm',
  'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': "'", 'פ': 'p',
  'ף': 'p', 'צ': 'ts', 'ץ': 'ts', 'ק': 'q', 'ר': 'r',
  'שׁ': 'sh', 'שׂ': 's', 'ש': 'sh', 'ת': 't'
};

// Basic transliteration (simplified)
function transliterate(text, language) {
  if (language === 'Hebrew') {
    // Remove Hebrew vowel points for cleaner transliteration
    let clean = text.replace(/[\u0591-\u05C7]/g, '');
    return clean.split('').map(c => HEBREW_TRANSLIT[c] || c).join('');
  }
  // For Greek, we'll use a simpler approach
  return text;
}

// Fetch from Bolls.life API
async function fetchFromBolls(bookNum, chapter, verse) {
  try {
    // Determine translation based on testament
    const translation = bookNum <= 39 ? 'WLC' : 'WLCC'; // Hebrew vs Greek
    
    const url = `https://bolls.life/get-text/${translation}/${bookNum}/${chapter}/${verse}/`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Bolls API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Bolls fetch error:', error);
    return null;
  }
}

// Fetch Strong's definition from Bolls.life
async function fetchStrongsDefinition(strongsNum) {
  try {
    const url = `https://bolls.life/dictionary-definition/BDBT/${strongsNum}`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('Strongs fetch error:', error);
    return null;
  }
}

// Parse interlinear text from Bolls API response
function parseInterlinearText(text, language) {
  const words = [];
  
  // Bolls uses various tagging formats
  // Try to extract words with Strong's numbers
  // Common format: <S>H1234</S> or <n>H1234</n> for Strong's
  
  // Split by spaces and process each token
  const tokens = text.split(/\s+/);
  let currentWord = null;
  
  for (const token of tokens) {
    // Check for Strong's number pattern
    const strongsMatch = token.match(/<[nS]>([HG]\d+)<\/[nS]>/i);
    const wordMatch = token.match(/<w[^>]*>([^<]+)<\/w>/);
    const plainWord = token.replace(/<[^>]*>/g, '').trim();
    
    if (strongsMatch) {
      if (currentWord) {
        currentWord.strongs = strongsMatch[1].toUpperCase();
        words.push(currentWord);
        currentWord = null;
      }
    } else if (plainWord && !plainWord.match(/^[HG]\d+$/)) {
      // It's a word, not just a Strong's number
      if (currentWord) {
        words.push(currentWord);
      }
      currentWord = {
        original: plainWord,
        translit: transliterate(plainWord, language),
        english: plainWord, // Will need translation lookup
        strongs: ''
      };
    }
  }
  
  if (currentWord) {
    words.push(currentWord);
  }
  
  return words;
}

// Pre-loaded interlinear data for popular verses (instant access)
const PRELOADED_VERSES = {
  'Genesis 1:1': {
    language: 'Hebrew',
    words: [
      { original: 'בְּרֵאשִׁית', translit: 'bereshit', english: 'In the beginning', strongs: 'H7225' },
      { original: 'בָּרָא', translit: 'bara', english: 'created', strongs: 'H1254' },
      { original: 'אֱלֹהִים', translit: 'elohim', english: 'God', strongs: 'H430' },
      { original: 'אֵת', translit: 'et', english: '[direct object marker]', strongs: 'H853' },
      { original: 'הַשָּׁמַיִם', translit: 'hashamayim', english: 'the heavens', strongs: 'H8064' },
      { original: 'וְאֵת', translit: "ve'et", english: 'and', strongs: 'H853' },
      { original: 'הָאָרֶץ', translit: "ha'aretz", english: 'the earth', strongs: 'H776' }
    ],
    fullText: 'In the beginning God created the heavens and the earth.'
  },
  'Genesis 1:2': {
    language: 'Hebrew',
    words: [
      { original: 'וְהָאָרֶץ', translit: "veha'aretz", english: 'And the earth', strongs: 'H776' },
      { original: 'הָיְתָה', translit: 'hayetah', english: 'was', strongs: 'H1961' },
      { original: 'תֹהוּ', translit: 'tohu', english: 'formless', strongs: 'H8414' },
      { original: 'וָבֹהוּ', translit: 'vabohu', english: 'and void', strongs: 'H922' },
      { original: 'וְחֹשֶׁךְ', translit: 'vechoshek', english: 'and darkness', strongs: 'H2822' },
      { original: 'עַל־פְּנֵי', translit: 'al-penei', english: 'over the face of', strongs: 'H5921' },
      { original: 'תְהוֹם', translit: 'tehom', english: 'the deep', strongs: 'H8415' },
      { original: 'וְרוּחַ', translit: 'veruach', english: 'And the Spirit of', strongs: 'H7307' },
      { original: 'אֱלֹהִים', translit: 'elohim', english: 'God', strongs: 'H430' },
      { original: 'מְרַחֶפֶת', translit: 'merachefet', english: 'was hovering', strongs: 'H7363' },
      { original: 'עַל־פְּנֵי', translit: 'al-penei', english: 'over the face of', strongs: 'H5921' },
      { original: 'הַמָּיִם', translit: 'hamayim', english: 'the waters', strongs: 'H4325' }
    ],
    fullText: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.'
  },
  'Genesis 1:3': {
    language: 'Hebrew',
    words: [
      { original: 'וַיֹּאמֶר', translit: 'vayomer', english: 'And said', strongs: 'H559' },
      { original: 'אֱלֹהִים', translit: 'elohim', english: 'God', strongs: 'H430' },
      { original: 'יְהִי', translit: 'yehi', english: 'Let there be', strongs: 'H1961' },
      { original: 'אוֹר', translit: 'or', english: 'light', strongs: 'H216' },
      { original: 'וַיְהִי', translit: 'vayehi', english: 'and there was', strongs: 'H1961' },
      { original: 'אוֹר', translit: 'or', english: 'light', strongs: 'H216' }
    ],
    fullText: 'And God said, Let there be light: and there was light.'
  },
  'John 1:1': {
    language: 'Greek',
    words: [
      { original: 'Ἐν', translit: 'En', english: 'In', strongs: 'G1722' },
      { original: 'ἀρχῇ', translit: 'archē', english: 'the beginning', strongs: 'G746' },
      { original: 'ἦν', translit: 'ēn', english: 'was', strongs: 'G1510' },
      { original: 'ὁ', translit: 'ho', english: 'the', strongs: 'G3588' },
      { original: 'Λόγος', translit: 'Logos', english: 'Word', strongs: 'G3056' },
      { original: 'καὶ', translit: 'kai', english: 'and', strongs: 'G2532' },
      { original: 'ὁ', translit: 'ho', english: 'the', strongs: 'G3588' },
      { original: 'Λόγος', translit: 'Logos', english: 'Word', strongs: 'G3056' },
      { original: 'ἦν', translit: 'ēn', english: 'was', strongs: 'G1510' },
      { original: 'πρὸς', translit: 'pros', english: 'with', strongs: 'G4314' },
      { original: 'τὸν', translit: 'ton', english: 'the', strongs: 'G3588' },
      { original: 'Θεόν', translit: 'Theon', english: 'God', strongs: 'G2316' },
      { original: 'καὶ', translit: 'kai', english: 'and', strongs: 'G2532' },
      { original: 'Θεὸς', translit: 'Theos', english: 'God', strongs: 'G2316' },
      { original: 'ἦν', translit: 'ēn', english: 'was', strongs: 'G1510' },
      { original: 'ὁ', translit: 'ho', english: 'the', strongs: 'G3588' },
      { original: 'Λόγος', translit: 'Logos', english: 'Word', strongs: 'G3056' }
    ],
    fullText: 'In the beginning was the Word, and the Word was with God, and the Word was God.'
  },
  'John 3:16': {
    language: 'Greek',
    words: [
      { original: 'Οὕτως', translit: 'Houtōs', english: 'For thus', strongs: 'G3779' },
      { original: 'γὰρ', translit: 'gar', english: 'for', strongs: 'G1063' },
      { original: 'ἠγάπησεν', translit: 'ēgapēsen', english: 'loved', strongs: 'G25' },
      { original: 'ὁ', translit: 'ho', english: 'the', strongs: 'G3588' },
      { original: 'Θεὸς', translit: 'Theos', english: 'God', strongs: 'G2316' },
      { original: 'τὸν', translit: 'ton', english: 'the', strongs: 'G3588' },
      { original: 'κόσμον', translit: 'kosmon', english: 'world', strongs: 'G2889' },
      { original: 'ὥστε', translit: 'hōste', english: 'that', strongs: 'G5620' },
      { original: 'τὸν', translit: 'ton', english: 'the', strongs: 'G3588' },
      { original: 'Υἱὸν', translit: 'Huion', english: 'Son', strongs: 'G5207' },
      { original: 'τὸν', translit: 'ton', english: 'the', strongs: 'G3588' },
      { original: 'μονογενῆ', translit: 'monogenē', english: 'only begotten', strongs: 'G3439' },
      { original: 'ἔδωκεν', translit: 'edōken', english: 'He gave', strongs: 'G1325' },
      { original: 'ἵνα', translit: 'hina', english: 'that', strongs: 'G2443' },
      { original: 'πᾶς', translit: 'pas', english: 'everyone', strongs: 'G3956' },
      { original: 'ὁ', translit: 'ho', english: 'who', strongs: 'G3588' },
      { original: 'πιστεύων', translit: 'pisteuōn', english: 'believes', strongs: 'G4100' },
      { original: 'εἰς', translit: 'eis', english: 'in', strongs: 'G1519' },
      { original: 'αὐτὸν', translit: 'auton', english: 'Him', strongs: 'G846' },
      { original: 'μὴ', translit: 'mē', english: 'not', strongs: 'G3361' },
      { original: 'ἀπόληται', translit: 'apolētai', english: 'should perish', strongs: 'G622' },
      { original: 'ἀλλ᾽', translit: 'all', english: 'but', strongs: 'G235' },
      { original: 'ἔχῃ', translit: 'echē', english: 'have', strongs: 'G2192' },
      { original: 'ζωὴν', translit: 'zōēn', english: 'life', strongs: 'G2222' },
      { original: 'αἰώνιον', translit: 'aiōnion', english: 'eternal', strongs: 'G166' }
    ],
    fullText: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'
  },
  'Psalm 23:1': {
    language: 'Hebrew',
    words: [
      { original: 'מִזְמוֹר', translit: 'mizmor', english: 'A Psalm', strongs: 'H4210' },
      { original: 'לְדָוִד', translit: 'leDavid', english: 'of David', strongs: 'H1732' },
      { original: 'יְהוָה', translit: 'YHWH', english: 'The LORD', strongs: 'H3068' },
      { original: 'רֹעִי', translit: "ro'i", english: 'is my shepherd', strongs: 'H7462' },
      { original: 'לֹא', translit: 'lo', english: 'not', strongs: 'H3808' },
      { original: 'אֶחְסָר', translit: 'echsar', english: 'I shall want', strongs: 'H2637' }
    ],
    fullText: 'The LORD is my shepherd; I shall not want.'
  },
  'Romans 8:28': {
    language: 'Greek',
    words: [
      { original: 'οἴδαμεν', translit: 'oidamen', english: 'we know', strongs: 'G1492' },
      { original: 'δὲ', translit: 'de', english: 'And', strongs: 'G1161' },
      { original: 'ὅτι', translit: 'hoti', english: 'that', strongs: 'G3754' },
      { original: 'τοῖς', translit: 'tois', english: 'to those', strongs: 'G3588' },
      { original: 'ἀγαπῶσιν', translit: 'agapōsin', english: 'loving', strongs: 'G25' },
      { original: 'τὸν', translit: 'ton', english: 'the', strongs: 'G3588' },
      { original: 'Θεὸν', translit: 'Theon', english: 'God', strongs: 'G2316' },
      { original: 'πάντα', translit: 'panta', english: 'all things', strongs: 'G3956' },
      { original: 'συνεργεῖ', translit: 'sunergei', english: 'work together', strongs: 'G4903' },
      { original: 'εἰς', translit: 'eis', english: 'for', strongs: 'G1519' },
      { original: 'ἀγαθόν', translit: 'agathon', english: 'good', strongs: 'G18' }
    ],
    fullText: 'And we know that all things work together for good to them that love God.'
  },
  'Philippians 4:13': {
    language: 'Greek',
    words: [
      { original: 'πάντα', translit: 'panta', english: 'All things', strongs: 'G3956' },
      { original: 'ἰσχύω', translit: 'ischuō', english: 'I can do', strongs: 'G2480' },
      { original: 'ἐν', translit: 'en', english: 'through', strongs: 'G1722' },
      { original: 'τῷ', translit: 'tō', english: 'the One', strongs: 'G3588' },
      { original: 'ἐνδυναμοῦντί', translit: 'endunamounti', english: 'strengthening', strongs: 'G1743' },
      { original: 'με', translit: 'me', english: 'me', strongs: 'G1473' }
    ],
    fullText: 'I can do all things through Christ which strengtheneth me.'
  },
  'Jeremiah 29:11': {
    language: 'Hebrew',
    words: [
      { original: 'כִּי', translit: 'ki', english: 'For', strongs: 'H3588' },
      { original: 'אָנֹכִי', translit: 'anokhi', english: 'I', strongs: 'H595' },
      { original: 'יָדַעְתִּי', translit: 'yadati', english: 'know', strongs: 'H3045' },
      { original: 'אֶת', translit: 'et', english: '[obj]', strongs: 'H853' },
      { original: 'הַמַּחֲשָׁבֹת', translit: 'hamachshavot', english: 'the plans', strongs: 'H4284' },
      { original: 'אֲשֶׁר', translit: 'asher', english: 'that', strongs: 'H834' },
      { original: 'אָנֹכִי', translit: 'anokhi', english: 'I', strongs: 'H595' },
      { original: 'חֹשֵׁב', translit: 'choshev', english: 'am thinking', strongs: 'H2803' },
      { original: 'עֲלֵיכֶם', translit: 'aleykhem', english: 'concerning you', strongs: 'H5921' }
    ],
    fullText: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.'
  },
  'Proverbs 3:5': {
    language: 'Hebrew',
    words: [
      { original: 'בְּטַח', translit: 'betach', english: 'Trust', strongs: 'H982' },
      { original: 'אֶל', translit: 'el', english: 'in', strongs: 'H413' },
      { original: 'יְהוָה', translit: 'YHWH', english: 'the LORD', strongs: 'H3068' },
      { original: 'בְּכָל', translit: 'bekhol', english: 'with all', strongs: 'H3605' },
      { original: 'לִבֶּךָ', translit: 'libekha', english: 'your heart', strongs: 'H3820' },
      { original: 'וְאֶל', translit: "ve'el", english: 'and not', strongs: 'H413' },
      { original: 'בִּינָתְךָ', translit: 'binatekha', english: 'on your own understanding', strongs: 'H998' },
      { original: 'אַל', translit: 'al', english: 'do not', strongs: 'H408' },
      { original: 'תִּשָּׁעֵן', translit: "tisha'en", english: 'lean', strongs: 'H8172' }
    ],
    fullText: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.'
  }
};

// Main handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { ref, book, chapter, verse } = req.query;
    
    let parsedRef;
    
    // Parse the reference
    if (ref) {
      parsedRef = parseReference(ref);
      if (!parsedRef) {
        return res.status(400).json({ 
          error: 'Invalid reference format. Use format like "Genesis 1:1" or "John 3:16"' 
        });
      }
    } else if (book && chapter && verse) {
      const bookNum = BOOK_MAP[book.toLowerCase()];
      if (!bookNum) {
        return res.status(400).json({ error: `Unknown book: ${book}` });
      }
      parsedRef = {
        bookNum,
        chapter: parseInt(chapter),
        verseStart: parseInt(verse),
        verseEnd: parseInt(verse),
        bookName: book
      };
    } else {
      return res.status(400).json({ 
        error: 'Missing parameters. Use ?ref=Genesis%201:1 or ?book=Genesis&chapter=1&verse=1' 
      });
    }
    
    // Normalize reference string for lookup
    const bookName = Object.keys(BOOK_MAP).find(k => BOOK_MAP[k] === parsedRef.bookNum && k.length > 3) || parsedRef.bookName;
    const capitalizedBook = bookName.charAt(0).toUpperCase() + bookName.slice(1);
    const referenceKey = `${capitalizedBook} ${parsedRef.chapter}:${parsedRef.verseStart}`;
    
    // Check pre-loaded data first
    if (PRELOADED_VERSES[referenceKey]) {
      return res.status(200).json({
        reference: referenceKey,
        source: 'preloaded',
        ...PRELOADED_VERSES[referenceKey]
      });
    }
    
    // Fetch from external API (Bolls.life)
    const language = getLanguage(parsedRef.bookNum);
    
    try {
      // Bolls.life interlinear endpoint
      // OT uses TISCH for Hebrew interlinear, NT uses various Greek texts
      const translation = language === 'Hebrew' ? 'OHB' : 'OGNT';
      const url = `https://bolls.life/get-chapter/${translation}/${parsedRef.bookNum}/${parsedRef.chapter}/`;
      
      const apiResponse = await fetch(url);
      
      if (apiResponse.ok) {
        const chapterData = await apiResponse.json();
        
        // Find the specific verse
        const verseData = chapterData.find(v => v.verse === parsedRef.verseStart);
        
        if (verseData && verseData.text) {
          // Parse the interlinear text - Bolls returns tagged text
          // Format varies but typically includes Strong's numbers
          const words = parseInterlinearText(verseData.text, language);
          
          if (words.length > 0) {
            return res.status(200).json({
              reference: referenceKey,
              source: 'api',
              language: language,
              words: words,
              fullText: verseData.text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
            });
          }
        }
      }
    } catch (fetchError) {
      console.error('External API fetch failed:', fetchError);
    }
    
    // Fallback if API fails
    return res.status(200).json({
      reference: referenceKey,
      source: 'api',
      language: language,
      available: false,
      message: 'Interlinear data temporarily unavailable. Try popular verses like Genesis 1:1, John 3:16, Psalm 23:1, or Romans 8:28'
    });
    
  } catch (error) {
    console.error('Interlinear API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

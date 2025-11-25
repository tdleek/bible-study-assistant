/**
 * GospelPath Strong's Dictionary API Endpoint
 *
 * Fetches Strong's Concordance definitions for Hebrew (H) and Greek (G) words.
 *
 * Usage: /api/strongs?num=H7225
 *        /api/strongs?num=G26
 *
 * Returns: {
 *   number: "H7225",
 *   lemma: "רֵאשִׁית",
 *   translit: "reshith",
 *   pronunciation: "ray-sheeth'",
 *   partOfSpeech: "noun feminine",
 *   definition: "beginning, first, chief",
 *   longDefinition: "...",
 *   usage: "Used 51 times..."
 * }
 */

// Pre-loaded common Strong's entries for instant access
const PRELOADED = {
  "H430": {
    lemma: "אֱלֹהִים",
    translit: "elohim",
    pronunciation: "el-o-heem'",
    partOfSpeech: "noun masculine plural",
    definition: "God, gods, judges, angels",
    longDefinition: "Plural form of 'eloah'. Used to denote the one true God (with singular verbs). The plural form may hint at the fullness and majesty of God.",
    usage: "Used 2,606 times in the Hebrew Bible"
  },
  "H1254": {
    lemma: "בָּרָא",
    translit: "bara",
    pronunciation: "baw-raw'",
    partOfSpeech: "verb",
    definition: "to create, shape, form",
    longDefinition: "A unique verb used ONLY for divine creation - never for human making. Emphasizes creating something new and wonderful.",
    usage: "Used 54 times, always with God as subject"
  },
  "H7225": {
    lemma: "רֵאשִׁית",
    translit: "reshith",
    pronunciation: "ray-sheeth'",
    partOfSpeech: "noun feminine",
    definition: "beginning, first, chief",
    longDefinition: "The first in time, place, order, or rank. Refers to the absolute beginning of creation.",
    usage: "Used 51 times in the Hebrew Bible"
  },
  "H3068": {
    lemma: "יְהֹוָה",
    translit: "YHWH",
    pronunciation: "yeh-ho-vaw'",
    partOfSpeech: "proper noun",
    definition: "the LORD, Yahweh",
    longDefinition: "The personal covenant name of God, often rendered 'LORD' in English Bibles. Related to 'I AM WHO I AM.'",
    usage: "Used 6,519 times - most frequent name for God"
  },
  "H7307": {
    lemma: "רוּחַ",
    translit: "ruach",
    pronunciation: "roo'-akh",
    partOfSpeech: "noun feminine",
    definition: "spirit, wind, breath",
    longDefinition: "Can refer to wind, breath, or spirit (human or divine). The Spirit of God (Ruach Elohim) moved over the waters in Genesis 1:2.",
    usage: "Used 378 times in the Hebrew Bible"
  },
  "H2617": {
    lemma: "חֶסֶד",
    translit: "chesed",
    pronunciation: "kheh'-sed",
    partOfSpeech: "noun masculine",
    definition: "lovingkindness, mercy, steadfast love",
    longDefinition: "Covenant faithfulness and loyal love. One of the most theologically rich words - untranslatable with a single English word.",
    usage: "Used 248 times, often describing God's character"
  },
  "G26": {
    lemma: "ἀγάπη",
    translit: "agape",
    pronunciation: "ag-ah'-pay",
    partOfSpeech: "noun feminine",
    definition: "love, charity, affection",
    longDefinition: "The highest form of love - selfless, sacrificial, unconditional. This is the love God has for humanity and calls us to show others.",
    usage: "Used 116 times in the New Testament"
  },
  "G25": {
    lemma: "ἀγαπάω",
    translit: "agapao",
    pronunciation: "ag-ap-ah'-o",
    partOfSpeech: "verb",
    definition: "to love",
    longDefinition: "The verb form of agapē. To love unconditionally, with purpose and commitment rather than just emotion.",
    usage: "Used 143 times in the New Testament"
  },
  "G2316": {
    lemma: "θεός",
    translit: "theos",
    pronunciation: "theh'-os",
    partOfSpeech: "noun masculine",
    definition: "God, a deity",
    longDefinition: "The supreme Divinity. Used throughout the New Testament to refer to the one true God.",
    usage: "Used 1,343 times in the New Testament"
  },
  "G3056": {
    lemma: "λόγος",
    translit: "logos",
    pronunciation: "log'-os",
    partOfSpeech: "noun masculine",
    definition: "word, speech, reason",
    longDefinition: "The Word - divine self-expression. In John 1:1, identifies Jesus as the eternal Word of God made flesh.",
    usage: "Used 330 times in the New Testament"
  },
  "G4100": {
    lemma: "πιστεύω",
    translit: "pisteuo",
    pronunciation: "pist-yoo'-o",
    partOfSpeech: "verb",
    definition: "to believe, trust, have faith",
    longDefinition: "To trust in, rely upon, place confidence in. More than intellectual assent - active trust and commitment.",
    usage: "Used 248 times in the New Testament"
  },
  "G4102": {
    lemma: "πίστις",
    translit: "pistis",
    pronunciation: "pis'-tis",
    partOfSpeech: "noun feminine",
    definition: "faith, belief, trust",
    longDefinition: "Conviction of truth, faithfulness. The means by which we receive salvation - trusting in Christ.",
    usage: "Used 244 times in the New Testament"
  },
  "G5485": {
    lemma: "χάρις",
    translit: "charis",
    pronunciation: "khar'-ece",
    partOfSpeech: "noun feminine",
    definition: "grace, favor, gratitude",
    longDefinition: "Unmerited favor from God. The foundation of salvation - we are saved by grace through faith.",
    usage: "Used 155 times in the New Testament"
  },
  "G1680": {
    lemma: "ἐλπίς",
    translit: "elpis",
    pronunciation: "el-pece'",
    partOfSpeech: "noun feminine",
    definition: "hope, expectation",
    longDefinition: "Confident expectation of good. Christian hope is certain because it rests on God's promises.",
    usage: "Used 53 times in the New Testament"
  },
  "G746": {
    lemma: "ἀρχή",
    translit: "arche",
    pronunciation: "ar-khay'",
    partOfSpeech: "noun feminine",
    definition: "beginning, origin, first cause",
    longDefinition: "The beginning point, the first in a series, or ruling power. Opens John's Gospel echoing Genesis.",
    usage: "Used 58 times in the New Testament"
  }
};

// Fetch Strong's definition from Bolls.life Dictionary API
async function fetchFromBolls(strongsNum) {
  try {
    // Bolls.life uses BDBT for Brown-Driver-Briggs-Thayer lexicon
    const url = `https://bolls.life/dictionary-definition/BDBT/${strongsNum}/`;
    console.log('🔍 Fetching Strong\'s from Bolls:', url);

    const response = await fetch(url);

    if (!response.ok) {
      console.log(`❌ Bolls returned HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('📖 Got Strong\'s data:', data);

    if (!data || !data[0]) {
      return null;
    }

    const entry = data[0];

    // Parse the definition - it often contains HTML
    const cleanDef = (entry.definition || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const shortDef = (entry.short_definition || cleanDef.split('.')[0] || '')
      .replace(/<[^>]*>/g, '')
      .trim();

    // Extract lemma (original word)
    const lemma = entry.lemma || entry.word || '';

    // Determine if Hebrew or Greek
    const isHebrew = strongsNum.startsWith('H');

    return {
      number: strongsNum,
      lemma: lemma,
      translit: entry.transliteration || transliterate(lemma, isHebrew),
      pronunciation: entry.pronunciation || '',
      partOfSpeech: entry.part_of_speech || '',
      definition: shortDef,
      longDefinition: cleanDef.substring(0, 500) + (cleanDef.length > 500 ? '...' : ''),
      usage: entry.occurrences ? `Used ${entry.occurrences} times` : '',
      source: 'bolls'
    };

  } catch (error) {
    console.error('❌ Bolls fetch error:', error.message);
    return null;
  }
}

// Simple transliteration for display
function transliterate(text, isHebrew) {
  if (!text) return '';

  if (isHebrew) {
    const map = {
      'א': "'", 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h',
      'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y',
      'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm', 'ם': 'm',
      'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': "'", 'פ': 'p',
      'ף': 'p', 'צ': 'ts', 'ץ': 'ts', 'ק': 'q', 'ר': 'r',
      'ש': 'sh', 'ת': 't'
    };
    // Remove vowel points and map consonants
    const clean = text.replace(/[\u0591-\u05C7]/g, '');
    return clean.split('').map(c => map[c] || c).join('');
  }

  // Greek - return as-is for now
  return text;
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
    const { num } = req.query;

    if (!num) {
      return res.status(400).json({
        error: 'Missing num parameter',
        usage: '/api/strongs?num=H7225',
        examples: ['H7225', 'H430', 'G26', 'G2316']
      });
    }

    // Normalize the Strong's number (uppercase, proper format)
    const strongsNum = num.toUpperCase().trim();

    // Validate format
    if (!/^[HG]\d+$/.test(strongsNum)) {
      return res.status(400).json({
        error: 'Invalid Strong\'s number format',
        received: num,
        expected: 'H#### for Hebrew or G#### for Greek (e.g., H7225, G26)'
      });
    }

    console.log(`\n========== STRONG'S REQUEST ==========`);
    console.log(`Number: ${strongsNum}`);

    // Check preloaded first
    if (PRELOADED[strongsNum]) {
      console.log('✅ Returning preloaded data');
      return res.status(200).json({
        number: strongsNum,
        source: 'preloaded',
        ...PRELOADED[strongsNum]
      });
    }

    // Fetch from Bolls.life API
    console.log('🌐 Fetching from Bolls.life API...');
    const data = await fetchFromBolls(strongsNum);

    if (data) {
      console.log('✅ Returning API data');
      return res.status(200).json(data);
    }

    // Fallback - not found
    console.log('⚠️ Strong\'s number not found');
    return res.status(404).json({
      error: 'Strong\'s number not found',
      number: strongsNum,
      message: `Definition for ${strongsNum} not available. Try: H7225, H430, G26, G2316`
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
}

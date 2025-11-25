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

// =============================================================================
// HEBREW STRONG'S GLOSS CACHE
// =============================================================================
// This cache provides accurate, contextually-appropriate English glosses for
// the most common Hebrew words. The Bolls.life API's short_definition field
// often returns generic or secondary meanings (e.g., "angels" for אֱלֹהִים
// instead of "God"). This cache ensures users see the primary biblical meaning.
//
// Format: Strong's Number -> { gloss: "primary meaning", translit: "transliteration" }
// =============================================================================
const HEBREW_GLOSS_CACHE = {
  // ==================== DIVINE NAMES & TITLES ====================
  'H430':  { gloss: 'God', translit: 'elohim' },           // אֱלֹהִים - Most common name for God
  'H3068': { gloss: 'the LORD', translit: 'YHWH' },        // יְהוָה - Covenant name of God
  'H136':  { gloss: 'Lord', translit: 'Adonai' },          // אֲדֹנָי - Master, Lord
  'H410':  { gloss: 'God', translit: 'El' },               // אֵל - God (singular)
  'H433':  { gloss: 'God', translit: 'Eloah' },            // אֱלוֹהַּ - God (poetic singular)
  'H5945': { gloss: 'Most High', translit: 'Elyon' },      // עֶלְיוֹן - Most High
  'H7706': { gloss: 'Almighty', translit: 'Shaddai' },     // שַׁדַּי - Almighty

  // ==================== COMMON VERBS ====================
  'H559':  { gloss: 'said', translit: 'amar' },            // אָמַר - to say
  'H1696': { gloss: 'spoke', translit: 'dabar' },          // דָּבַר - to speak
  'H1961': { gloss: 'was/be', translit: 'hayah' },         // הָיָה - to be, become
  'H5414': { gloss: 'gave', translit: 'natan' },           // נָתַן - to give
  'H6213': { gloss: 'made/do', translit: 'asah' },         // עָשָׂה - to do, make
  'H7200': { gloss: 'saw', translit: 'raah' },             // רָאָה - to see
  'H8085': { gloss: 'heard', translit: 'shama' },          // שָׁמַע - to hear
  'H3045': { gloss: 'know', translit: 'yada' },            // יָדַע - to know
  'H1254': { gloss: 'created', translit: 'bara' },         // בָּרָא - to create (divine)
  'H3318': { gloss: 'went out', translit: 'yatsa' },       // יָצָא - to go out
  'H935':  { gloss: 'came', translit: 'bo' },              // בּוֹא - to come, enter
  'H3212': { gloss: 'went', translit: 'halak' },           // הָלַךְ - to walk, go
  'H5975': { gloss: 'stood', translit: 'amad' },           // עָמַד - to stand
  'H3427': { gloss: 'dwelt', translit: 'yashab' },         // יָשַׁב - to dwell, sit
  'H7725': { gloss: 'returned', translit: 'shuv' },        // שׁוּב - to return
  'H6680': { gloss: 'commanded', translit: 'tsavah' },     // צָוָה - to command
  'H7121': { gloss: 'called', translit: 'qara' },          // קָרָא - to call
  'H3947': { gloss: 'took', translit: 'laqach' },          // לָקַח - to take
  'H7971': { gloss: 'sent', translit: 'shalach' },         // שָׁלַח - to send
  'H5307': { gloss: 'fell', translit: 'naphal' },          // נָפַל - to fall
  'H6965': { gloss: 'arose', translit: 'qum' },            // קוּם - to arise
  'H4191': { gloss: 'died', translit: 'mut' },             // מוּת - to die
  'H2421': { gloss: 'lived', translit: 'chayah' },         // חָיָה - to live
  'H157':  { gloss: 'loved', translit: 'ahav' },           // אָהַב - to love
  'H3372': { gloss: 'feared', translit: 'yare' },          // יָרֵא - to fear
  'H982':  { gloss: 'trusted', translit: 'batach' },       // בָּטַח - to trust
  'H539':  { gloss: 'believed', translit: 'aman' },        // אָמַן - to believe
  'H1288': { gloss: 'blessed', translit: 'barak' },        // בָּרַךְ - to bless
  'H6419': { gloss: 'prayed', translit: 'palal' },         // פָּלַל - to pray
  'H7812': { gloss: 'worshiped', translit: 'shachah' },    // שָׁחָה - to bow down
  'H3467': { gloss: 'saved', translit: 'yasha' },          // יָשַׁע - to save
  'H5337': { gloss: 'delivered', translit: 'natsal' },     // נָצַל - to deliver
  'H7462': { gloss: 'shepherds', translit: 'raah' },       // רָעָה - to shepherd
  'H2637': { gloss: 'lack', translit: 'chaser' },          // חָסֵר - to lack, want

  // ==================== COMMON NOUNS ====================
  'H776':  { gloss: 'earth/land', translit: 'erets' },     // אֶרֶץ - earth, land
  'H8064': { gloss: 'heavens', translit: 'shamayim' },     // שָׁמַיִם - heavens, sky
  'H3117': { gloss: 'day', translit: 'yom' },              // יוֹם - day
  'H3915': { gloss: 'night', translit: 'layil' },          // לַיְלָה - night
  'H4325': { gloss: 'water', translit: 'mayim' },          // מַיִם - water
  'H784':  { gloss: 'fire', translit: 'esh' },             // אֵשׁ - fire
  'H7307': { gloss: 'spirit/wind', translit: 'ruach' },    // רוּחַ - spirit, wind
  'H5315': { gloss: 'soul', translit: 'nephesh' },         // נֶפֶשׁ - soul, life
  'H3820': { gloss: 'heart', translit: 'lev' },            // לֵב - heart
  'H1697': { gloss: 'word', translit: 'dabar' },           // דָּבָר - word, thing
  'H8034': { gloss: 'name', translit: 'shem' },            // שֵׁם - name
  'H1': { gloss: 'father', translit: 'av' },               // אָב - father
  'H517':  { gloss: 'mother', translit: 'em' },            // אֵם - mother
  'H1121': { gloss: 'son', translit: 'ben' },              // בֵּן - son
  'H1323': { gloss: 'daughter', translit: 'bat' },         // בַּת - daughter
  'H376':  { gloss: 'man', translit: 'ish' },              // אִישׁ - man
  'H802':  { gloss: 'woman/wife', translit: 'ishah' },     // אִשָּׁה - woman, wife
  'H5971': { gloss: 'people', translit: 'am' },            // עַם - people
  'H1471': { gloss: 'nation', translit: 'goy' },           // גּוֹי - nation
  'H4428': { gloss: 'king', translit: 'melek' },           // מֶלֶךְ - king
  'H5650': { gloss: 'servant', translit: 'eved' },         // עֶבֶד - servant
  'H3548': { gloss: 'priest', translit: 'kohen' },         // כֹּהֵן - priest
  'H5030': { gloss: 'prophet', translit: 'navi' },         // נָבִיא - prophet
  'H4397': { gloss: 'messenger/angel', translit: 'malak' }, // מַלְאָךְ - angel
  'H1004': { gloss: 'house', translit: 'bayit' },          // בַּיִת - house
  'H5892': { gloss: 'city', translit: 'ir' },              // עִיר - city
  'H1870': { gloss: 'way/path', translit: 'derek' },       // דֶּרֶךְ - way, path
  'H216':  { gloss: 'light', translit: 'or' },             // אוֹר - light
  'H2822': { gloss: 'darkness', translit: 'choshek' },     // חֹשֶׁךְ - darkness
  'H2416': { gloss: 'life/living', translit: 'chay' },     // חַי - life, living
  'H4194': { gloss: 'death', translit: 'mavet' },          // מָוֶת - death
  'H7965': { gloss: 'peace', translit: 'shalom' },         // שָׁלוֹם - peace
  'H2617': { gloss: 'steadfast love', translit: 'chesed' }, // חֶסֶד - lovingkindness
  'H571':  { gloss: 'truth', translit: 'emet' },           // אֱמֶת - truth
  'H6664': { gloss: 'righteousness', translit: 'tsedeq' }, // צֶדֶק - righteousness
  'H4941': { gloss: 'justice', translit: 'mishpat' },      // מִשְׁפָּט - justice
  'H8451': { gloss: 'law/Torah', translit: 'torah' },      // תּוֹרָה - law, instruction
  'H1285': { gloss: 'covenant', translit: 'berit' },       // בְּרִית - covenant
  'H2403': { gloss: 'sin', translit: 'chatta' },           // חַטָּאת - sin
  'H5771': { gloss: 'iniquity', translit: 'avon' },        // עָוֺן - iniquity
  'H6588': { gloss: 'transgression', translit: 'pesha' },  // פֶּשַׁע - transgression
  'H3444': { gloss: 'salvation', translit: 'yeshuah' },    // יְשׁוּעָה - salvation
  'H1293': { gloss: 'blessing', translit: 'berakah' },     // בְּרָכָה - blessing
  'H8605': { gloss: 'prayer', translit: 'tefillah' },      // תְּפִלָּה - prayer

  // ==================== PARTICLES & PREPOSITIONS ====================
  'H853':  { gloss: '[obj]', translit: 'et' },             // אֵת - direct object marker
  'H3605': { gloss: 'all', translit: 'kol' },              // כֹּל - all, every
  'H3808': { gloss: 'not', translit: 'lo' },               // לֹא - not
  'H408':  { gloss: 'not', translit: 'al' },               // אַל - not (jussive)
  'H3588': { gloss: 'for/that', translit: 'ki' },          // כִּי - for, because, that
  'H834':  { gloss: 'which/who', translit: 'asher' },      // אֲשֶׁר - which, who
  'H5921': { gloss: 'upon/over', translit: 'al' },         // עַל - upon, over
  'H413':  { gloss: 'to/toward', translit: 'el' },         // אֶל - to, toward
  'H4480': { gloss: 'from', translit: 'min' },             // מִן - from
  'H5973': { gloss: 'with', translit: 'im' },              // עִם - with
  'H996':  { gloss: 'between', translit: 'bein' },         // בֵּין - between
  'H6440': { gloss: 'face/before', translit: 'panim' },    // פָּנִים - face, before
  'H310':  { gloss: 'after', translit: 'achar' },          // אַחַר - after
  'H6924': { gloss: 'before/east', translit: 'qedem' },    // קֶדֶם - before, east
  'H2088': { gloss: 'this', translit: 'zeh' },             // זֶה - this (masc)
  'H2063': { gloss: 'this', translit: 'zot' },             // זֹאת - this (fem)
  'H1931': { gloss: 'he/it', translit: 'hu' },             // הוּא - he, it
  'H1992': { gloss: 'they', translit: 'hem' },             // הֵם - they (masc)
  'H595':  { gloss: 'I', translit: 'anokhi' },             // אָנֹכִי - I
  'H589':  { gloss: 'I', translit: 'ani' },                // אֲנִי - I
  'H859':  { gloss: 'you', translit: 'attah' },            // אַתָּה - you (masc sg)

  // ==================== NUMBERS ====================
  'H259':  { gloss: 'one', translit: 'echad' },            // אֶחָד - one
  'H8147': { gloss: 'two', translit: 'shenayim' },         // שְׁנַיִם - two
  'H7969': { gloss: 'three', translit: 'shalosh' },        // שָׁלוֹשׁ - three
  'H7651': { gloss: 'seven', translit: 'sheva' },          // שֶׁבַע - seven
  'H6235': { gloss: 'ten', translit: 'eser' },             // עֶשֶׂר - ten

  // ==================== ADJECTIVES ====================
  'H2896': { gloss: 'good', translit: 'tov' },             // טוֹב - good
  'H7451': { gloss: 'evil/bad', translit: 'ra' },          // רַע - evil, bad
  'H1419': { gloss: 'great', translit: 'gadol' },          // גָּדוֹל - great
  'H6996': { gloss: 'small', translit: 'qatan' },          // קָטָן - small
  'H7227': { gloss: 'many/great', translit: 'rav' },       // רַב - many, great
  'H6918': { gloss: 'holy', translit: 'qadosh' },          // קָדוֹשׁ - holy
  'H2389': { gloss: 'strong', translit: 'chazaq' },        // חָזָק - strong
  'H3477': { gloss: 'upright', translit: 'yashar' },       // יָשָׁר - upright

  // ==================== GENESIS 1 SPECIFIC ====================
  'H7225': { gloss: 'beginning', translit: 'reshit' },     // רֵאשִׁית - beginning
  'H8414': { gloss: 'formless', translit: 'tohu' },        // תֹהוּ - formless, void
  'H922':  { gloss: 'void', translit: 'bohu' },            // בֹהוּ - void, emptiness
  'H8415': { gloss: 'deep', translit: 'tehom' },           // תְּהוֹם - deep, abyss
  'H7363': { gloss: 'hovering', translit: 'rachaph' },     // רָחַף - to hover
  'H7549': { gloss: 'expanse', translit: 'raqia' },        // רָקִיעַ - expanse, firmament
  'H3556': { gloss: 'stars', translit: 'kokav' },          // כּוֹכָב - star

  // ==================== EXODUS 20 (TEN COMMANDMENTS) ====================
  'H6440': { gloss: 'face/presence', translit: 'panim' },  // פָּנִים - face
  'H6754': { gloss: 'image', translit: 'tselem' },         // צֶלֶם - image
  'H5375': { gloss: 'take/lift', translit: 'nasa' },       // נָשָׂא - to lift, carry
  'H7723': { gloss: 'vain/false', translit: 'shav' },      // שָׁוְא - vain, false
  'H2142': { gloss: 'remember', translit: 'zakar' },       // זָכַר - to remember
  'H7676': { gloss: 'Sabbath', translit: 'shabbat' },      // שַׁבָּת - Sabbath
  'H6942': { gloss: 'sanctify', translit: 'qadash' },      // קָדַשׁ - to sanctify
  'H3513': { gloss: 'honor', translit: 'kavad' },          // כָּבַד - to honor
  'H7523': { gloss: 'murder', translit: 'ratsach' },       // רָצַח - to murder
  'H5003': { gloss: 'commit adultery', translit: 'naaph' }, // נָאַף - to commit adultery
  'H1589': { gloss: 'steal', translit: 'ganav' },          // גָּנַב - to steal
  'H6030': { gloss: 'answer/testify', translit: 'anah' },  // עָנָה - to answer
  'H8267': { gloss: 'false', translit: 'sheqer' },         // שֶׁקֶר - falsehood
  'H2530': { gloss: 'covet', translit: 'chamad' },         // חָמַד - to covet

  // ==================== PSALM 23 SPECIFIC ====================
  'H4999': { gloss: 'pastures', translit: 'naah' },        // נָאָה - pasture
  'H1877': { gloss: 'green', translit: 'deshe' },          // דֶּשֶׁא - grass, green
  'H7257': { gloss: 'lie down', translit: 'ravats' },      // רָבַץ - to lie down
  'H4496': { gloss: 'rest', translit: 'menuchah' },        // מְנוּחָה - rest
  'H5095': { gloss: 'lead', translit: 'nahal' },           // נָהַל - to lead
  'H5148': { gloss: 'guide', translit: 'nachah' },         // נָחָה - to guide
  'H4570': { gloss: 'paths', translit: 'magal' },          // מַעְגָּל - path
  'H6738': { gloss: 'shadow', translit: 'tsel' },          // צֵל - shadow
  'H7626': { gloss: 'rod', translit: 'shevet' },           // שֵׁבֶט - rod, staff
  'H4938': { gloss: 'staff', translit: 'mishenet' },       // מִשְׁעֶנֶת - staff
  'H5162': { gloss: 'comfort', translit: 'nacham' },       // נָחַם - to comfort
  'H7218': { gloss: 'head', translit: 'rosh' },            // רֹאשׁ - head
  'H8081': { gloss: 'oil', translit: 'shemen' },           // שֶׁמֶן - oil
  'H3563': { gloss: 'cup', translit: 'kos' },              // כּוֹס - cup
  'H7310': { gloss: 'overflow', translit: 'revayah' },     // רְוָיָה - overflow

  // ==================== ISAIAH 53 SPECIFIC ====================
  'H2490': { gloss: 'pierced', translit: 'chalal' },       // חָלַל - to pierce
  'H1792': { gloss: 'crushed', translit: 'daka' },         // דָּכָא - to crush
  'H4148': { gloss: 'discipline', translit: 'musar' },     // מוּסָר - discipline
  'H2250': { gloss: 'stripes', translit: 'chaburah' },     // חַבּוּרָה - wound, stripe
  'H7495': { gloss: 'healed', translit: 'rapha' },         // רָפָא - to heal

  // ==================== ADDITIONAL COMMON WORDS ====================
  'H5002': { gloss: 'declares', translit: 'neum' },        // נְאֻם - declaration
  'H4284': { gloss: 'plans', translit: 'machashavah' },    // מַחֲשָׁבָה - thought, plan
  'H2803': { gloss: 'think/plan', translit: 'chashav' },   // חָשַׁב - to think
  'H6960': { gloss: 'wait/hope', translit: 'qavah' },      // קָוָה - to wait
  'H2498': { gloss: 'renew', translit: 'chalaph' },        // חָלַף - to renew
  'H3581': { gloss: 'strength', translit: 'koach' },       // כֹּחַ - strength
  'H5927': { gloss: 'go up', translit: 'alah' },           // עָלָה - to go up
  'H83':   { gloss: 'wing', translit: 'ever' },            // אֵבֶר - wing
  'H5404': { gloss: 'eagle', translit: 'nesher' },         // נֶשֶׁר - eagle
  'H428':  { gloss: 'these', translit: 'elleh' },          // אֵלֶּה - these
};

// Simple transliteration for Hebrew
// Used as fallback when API transliteration is not available
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

// =============================================================================
// ENRICH WORDS WITH STRONG'S DEFINITIONS
// =============================================================================
// This function enhances the word data with accurate English glosses.
// It uses a three-tier lookup strategy:
//   1. Local cache (HEBREW_GLOSS_CACHE) - instant, accurate glosses
//   2. Parse the full BDB definition from Bolls.life API
//   3. Fallback to short_definition if parsing fails
// =============================================================================
async function enrichWithStrongs(words, language) {
  const enriched = [...words];

  for (let i = 0; i < enriched.length; i++) {
    const word = enriched[i];
    if (!word.strongs) continue;

    // Already has a gloss? Skip (unless it's empty)
    if (word.english && word.english.trim()) continue;

    // =========================================================
    // TIER 1: Check local cache first (Hebrew only for now)
    // =========================================================
    if (language === 'Hebrew' && HEBREW_GLOSS_CACHE[word.strongs]) {
      const cached = HEBREW_GLOSS_CACHE[word.strongs];
      word.english = cached.gloss;
      // Also use better transliteration if available
      if (cached.translit && (!word.translit || word.translit.length < 2)) {
        word.translit = cached.translit;
      }
      console.log(`  ✓ Cache hit: ${word.strongs} → "${cached.gloss}"`);
      continue;
    }

    // =========================================================
    // TIER 2 & 3: Fetch from Bolls.life API
    // =========================================================
    try {
      const url = `https://bolls.life/dictionary-definition/BDBT/${word.strongs}/`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data && data[0]) {
          const entry = data[0];

          // Use API transliteration if better than our generated one
          if (entry.transliteration && entry.transliteration.length > 1) {
            // Clean up the transliteration (remove special chars)
            word.translit = entry.transliteration
              .replace(/[ʼˈˌ]/g, "'")
              .replace(/[āâ]/g, 'a')
              .replace(/[ēêé]/g, 'e')
              .replace(/[īîı̂]/g, 'i')
              .replace(/[ōôó]/g, 'o')
              .replace(/[ūû]/g, 'u');
          }

          // =====================================================
          // TIER 2: Parse full BDB definition for better gloss
          // =====================================================
          const fullDef = entry.definition || '';
          let bestGloss = extractBestGloss(fullDef, language);

          if (bestGloss) {
            word.english = bestGloss;
            console.log(`  ✓ Parsed: ${word.strongs} → "${bestGloss}"`);
          } else {
            // =================================================
            // TIER 3: Fallback to short_definition
            // =================================================
            const shortDef = entry.short_definition || '';
            word.english = shortDef
              .replace(/<[^>]*>/g, '')
              .split(/[,;]/)[0]
              .trim()
              .substring(0, 25);
            console.log(`  ~ Fallback: ${word.strongs} → "${word.english}"`);
          }
        }
      }
    } catch (e) {
      console.log(`  ✗ API error for ${word.strongs}: ${e.message}`);
    }
  }

  return enriched;
}

// =============================================================================
// EXTRACT BEST GLOSS FROM BDB DEFINITION
// =============================================================================
// The BDB (Brown-Driver-Briggs) definition contains rich information but
// in complex HTML format. This function extracts the most appropriate gloss.
//
// Strategy:
//   1. Look for the primary meaning in the first <li> or <ol> element
//   2. Extract verbs in "to X" format for action words
//   3. Handle nouns and other parts of speech appropriately
//   4. Prefer shorter, cleaner glosses
// =============================================================================
function extractBestGloss(htmlDef, language) {
  if (!htmlDef) return null;

  // Remove HTML tags but preserve structure hints
  let text = htmlDef
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<p\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<li>/gi, '|ITEM|')
    .replace(/<\/li>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split by list items
  const items = text.split('|ITEM|').filter(s => s.trim());

  if (items.length === 0) return null;

  // Look through items for best gloss
  for (const item of items) {
    const cleaned = item.trim();

    // Skip if too short or just a reference
    if (cleaned.length < 2) continue;
    if (/^[A-Z]?\d+$/.test(cleaned)) continue; // Just a number
    if (/^Origin:/.test(cleaned)) continue;
    if (/^TWOT/.test(cleaned)) continue;
    if (/^Part\(s\)/.test(cleaned)) continue;
    if (/^Phonetic:/.test(cleaned)) continue;
    if (/^Transliteration:/.test(cleaned)) continue;
    if (/^Original:/.test(cleaned)) continue;
    if (/^BDB Definition/.test(cleaned)) continue;

    // Extract the gloss - look for patterns like "to speak", "God", etc.

    // Pattern 1: "to VERB" at start
    const verbMatch = cleaned.match(/^to\s+(\w+)/i);
    if (verbMatch) {
      return verbMatch[0].toLowerCase();
    }

    // Pattern 2: Simple noun/adjective at start (before punctuation)
    const simpleMatch = cleaned.match(/^([a-zA-Z][a-zA-Z\s-]{1,20}?)(?:[,;:\(\[]|$)/);
    if (simpleMatch) {
      const gloss = simpleMatch[1].trim().toLowerCase();
      // Skip if it's just a letter/number or too generic
      if (gloss.length > 1 && !/^[a-z]$/.test(gloss)) {
        return gloss;
      }
    }
  }

  return null;
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
      // Enrich with Strong's definitions (pass language for cache lookup)
      console.log('📚 Enriching with Strong\'s definitions...');
      const enrichedWords = await enrichWithStrongs(data.words, language);
      
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

/**
 * GospelPath Cross-References API Endpoint
 *
 * Returns cross-references for a given Bible verse from the Treasury of Scripture
 * Knowledge (TSK) dataset. Cross-references help users explore related passages
 * that share themes, prophecies, or doctrinal connections.
 *
 * Data Source: OpenBible.info / Treasury of Scripture Knowledge (public domain)
 * The references are ranked by community votes for relevance.
 *
 * Usage: /api/cross-references?ref=John%203:16
 *
 * Response:
 * {
 *   "reference": "John 3:16",
 *   "crossReferences": ["Romans 5:8", "1 John 4:9", "John 3:36", ...]
 * }
 *
 * =============================================================================
 * ABOUT THE TREASURY OF SCRIPTURE KNOWLEDGE
 * =============================================================================
 * The Treasury of Scripture Knowledge (TSK) is one of the most comprehensive
 * cross-reference resources ever compiled, containing ~340,000 cross-references.
 * It was developed by R.A. Torrey from references in Rev. Thomas Scott's
 * Commentary and the Comprehensive Bible. The TSK is in the public domain.
 * =============================================================================
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// =============================================================================
// CROSS-REFERENCE DATA (loaded from JSON files)
// =============================================================================
// We maintain two files:
// 1. cross-references-popular.json - Small file with ~100 common verses (15KB)
// 2. cross-references.json - Full database with ~30,000 verses (3.3MB)
//
// We load the popular file immediately for fast responses to common queries,
// and lazy-load the full database only when needed.
// =============================================================================

let popularCrossRefs = null;
let fullCrossRefs = null;

/**
 * Load the popular cross-references file (small, fast)
 */
function loadPopularCrossRefs() {
    if (popularCrossRefs) return popularCrossRefs;

    try {
        const filePath = join(process.cwd(), 'data', 'cross-references-popular.json');
        const content = readFileSync(filePath, 'utf-8');
        popularCrossRefs = JSON.parse(content);
        console.log('✓ Popular cross-references loaded');
        return popularCrossRefs;
    } catch (error) {
        console.error('✗ Failed to load popular cross-references:', error.message);
        return null;
    }
}

/**
 * Load the full cross-references file (larger, lazy-loaded)
 */
function loadFullCrossRefs() {
    if (fullCrossRefs) return fullCrossRefs;

    try {
        const filePath = join(process.cwd(), 'data', 'cross-references.json');
        const content = readFileSync(filePath, 'utf-8');
        fullCrossRefs = JSON.parse(content);
        console.log('✓ Full cross-references database loaded');
        return fullCrossRefs;
    } catch (error) {
        console.error('✗ Failed to load full cross-references:', error.message);
        return null;
    }
}

// =============================================================================
// BOOK NAME MAPPINGS
// =============================================================================
// Maps various book name formats to the key format used in our JSON files.
// Keys in the JSON use OpenBible abbreviations (e.g., "gen_1_1", "john_3_16")
// =============================================================================

const BOOK_TO_KEY = {
    'genesis': 'gen', 'gen': 'gen',
    'exodus': 'exod', 'exod': 'exod', 'ex': 'exod',
    'leviticus': 'lev', 'lev': 'lev',
    'numbers': 'num', 'num': 'num',
    'deuteronomy': 'deut', 'deut': 'deut', 'dt': 'deut',
    'joshua': 'josh', 'josh': 'josh',
    'judges': 'judg', 'judg': 'judg',
    'ruth': 'ruth',
    '1 samuel': '1sam', '1samuel': '1sam', '1sam': '1sam',
    '2 samuel': '2sam', '2samuel': '2sam', '2sam': '2sam',
    '1 kings': '1kgs', '1kings': '1kgs', '1kgs': '1kgs',
    '2 kings': '2kgs', '2kings': '2kgs', '2kgs': '2kgs',
    '1 chronicles': '1chr', '1chronicles': '1chr', '1chr': '1chr',
    '2 chronicles': '2chr', '2chronicles': '2chr', '2chr': '2chr',
    'ezra': 'ezra',
    'nehemiah': 'neh', 'neh': 'neh',
    'esther': 'esth', 'esth': 'esth',
    'job': 'job',
    'psalms': 'ps', 'psalm': 'ps', 'ps': 'ps', 'psa': 'ps',
    'proverbs': 'prov', 'prov': 'prov', 'pr': 'prov',
    'ecclesiastes': 'eccl', 'eccl': 'eccl', 'ecc': 'eccl',
    'song of solomon': 'song', 'song': 'song', 'sos': 'song',
    'isaiah': 'isa', 'isa': 'isa',
    'jeremiah': 'jer', 'jer': 'jer',
    'lamentations': 'lam', 'lam': 'lam',
    'ezekiel': 'ezek', 'ezek': 'ezek',
    'daniel': 'dan', 'dan': 'dan',
    'hosea': 'hos', 'hos': 'hos',
    'joel': 'joel',
    'amos': 'amos',
    'obadiah': 'obad', 'obad': 'obad',
    'jonah': 'jonah', 'jon': 'jonah',
    'micah': 'mic', 'mic': 'mic',
    'nahum': 'nah', 'nah': 'nah',
    'habakkuk': 'hab', 'hab': 'hab',
    'zephaniah': 'zeph', 'zeph': 'zeph',
    'haggai': 'hag', 'hag': 'hag',
    'zechariah': 'zech', 'zech': 'zech',
    'malachi': 'mal', 'mal': 'mal',
    'matthew': 'matt', 'matt': 'matt', 'mt': 'matt',
    'mark': 'mark', 'mk': 'mark',
    'luke': 'luke', 'lk': 'luke',
    'john': 'john', 'jn': 'john',
    'acts': 'acts',
    'romans': 'rom', 'rom': 'rom',
    '1 corinthians': '1cor', '1corinthians': '1cor', '1cor': '1cor',
    '2 corinthians': '2cor', '2corinthians': '2cor', '2cor': '2cor',
    'galatians': 'gal', 'gal': 'gal',
    'ephesians': 'eph', 'eph': 'eph',
    'philippians': 'phil', 'phil': 'phil',
    'colossians': 'col', 'col': 'col',
    '1 thessalonians': '1thess', '1thessalonians': '1thess', '1thess': '1thess',
    '2 thessalonians': '2thess', '2thessalonians': '2thess', '2thess': '2thess',
    '1 timothy': '1tim', '1timothy': '1tim', '1tim': '1tim',
    '2 timothy': '2tim', '2timothy': '2tim', '2tim': '2tim',
    'titus': 'titus', 'tit': 'titus',
    'philemon': 'phlm', 'phlm': 'phlm',
    'hebrews': 'heb', 'heb': 'heb',
    'james': 'jas', 'jas': 'jas',
    '1 peter': '1pet', '1peter': '1pet', '1pet': '1pet',
    '2 peter': '2pet', '2peter': '2pet', '2pet': '2pet',
    '1 john': '1john', '1john': '1john', '1jn': '1john',
    '2 john': '2john', '2john': '2john', '2jn': '2john',
    '3 john': '3john', '3john': '3john', '3jn': '3john',
    'jude': 'jude',
    'revelation': 'rev', 'rev': 'rev'
};

/**
 * Parse a verse reference and create the lookup key
 * @param {string} ref - Reference like "John 3:16" or "1 Corinthians 13:4"
 * @returns {string|null} - Key like "john_3_16" or null if invalid
 */
function parseReferenceToKey(ref) {
    // Handle references like "John 3:16", "1 Corinthians 13:4-7", "Genesis 1:1"
    const match = ref.match(/^(\d?\s*\w+(?:\s+\w+)?)\s+(\d+):(\d+)(?:-\d+)?$/i);
    if (!match) return null;

    const bookName = match[1].toLowerCase().trim();
    const chapter = match[2];
    const verse = match[3];

    const bookKey = BOOK_TO_KEY[bookName];
    if (!bookKey) return null;

    return `${bookKey}_${chapter}_${verse}`;
}

/**
 * Get cross-references for a verse
 * @param {string} key - Lookup key like "john_3_16"
 * @returns {string[]|null} - Array of cross-reference strings or null
 */
function getCrossReferences(key) {
    // First, try the popular verses file (fast)
    const popular = loadPopularCrossRefs();
    if (popular && popular[key]) {
        return popular[key];
    }

    // Fall back to the full database
    const full = loadFullCrossRefs();
    if (full && full[key]) {
        return full[key];
    }

    return null;
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { ref } = req.query;

        if (!ref) {
            return res.status(400).json({
                error: 'Missing ref parameter',
                usage: '/api/cross-references?ref=John%203:16'
            });
        }

        // Parse the reference to get the lookup key
        const key = parseReferenceToKey(ref);

        if (!key) {
            return res.status(400).json({
                error: 'Invalid reference format',
                received: ref,
                example: 'John 3:16'
            });
        }

        // Look up cross-references
        const crossRefs = getCrossReferences(key);

        if (!crossRefs || crossRefs.length === 0) {
            return res.status(200).json({
                reference: ref,
                crossReferences: [],
                note: 'No cross-references found for this verse'
            });
        }

        return res.status(200).json({
            reference: ref,
            crossReferences: crossRefs,
            source: 'Treasury of Scripture Knowledge'
        });

    } catch (error) {
        console.error('Cross-references API error:', error);
        return res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
}

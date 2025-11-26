/**
 * Convert OpenBible.info Cross-References to Compact JSON
 *
 * This script converts the OpenBible.info cross-references data (TSV format)
 * into a compact JSON format for use in the GospelPath app.
 *
 * Source: https://www.openbible.info/labs/cross-references/
 * The data is based primarily on the Treasury of Scripture Knowledge (TSK),
 * which is public domain and contains ~340,000 cross-references.
 *
 * OUTPUT FORMAT:
 * The output is a simple key-value object where:
 * - Key: normalized verse reference (e.g., "gen_1_1")
 * - Value: array of cross-reference strings (e.g., ["Psalm 33:9", "John 1:1"])
 *
 * This compact format reduces file size significantly by:
 * - Using short keys
 * - Storing only the reference strings (no votes/metadata)
 * - Limiting to top 8 references per verse (by vote count)
 *
 * Run with: node scripts/convert-cross-references.js
 * Requires: cross-references.txt in the same directory (unzipped from OpenBible)
 */

const fs = require('fs');
const path = require('path');

// Book name abbreviations used by OpenBible.info -> standard names
const BOOK_ABBREV_MAP = {
    'Gen': 'Genesis', 'Exod': 'Exodus', 'Lev': 'Leviticus', 'Num': 'Numbers',
    'Deut': 'Deuteronomy', 'Josh': 'Joshua', 'Judg': 'Judges', 'Ruth': 'Ruth',
    '1Sam': '1 Samuel', '2Sam': '2 Samuel', '1Kgs': '1 Kings', '2Kgs': '2 Kings',
    '1Chr': '1 Chronicles', '2Chr': '2 Chronicles', 'Ezra': 'Ezra', 'Neh': 'Nehemiah',
    'Esth': 'Esther', 'Job': 'Job', 'Ps': 'Psalm', 'Prov': 'Proverbs',
    'Eccl': 'Ecclesiastes', 'Song': 'Song of Solomon', 'Isa': 'Isaiah', 'Jer': 'Jeremiah',
    'Lam': 'Lamentations', 'Ezek': 'Ezekiel', 'Dan': 'Daniel', 'Hos': 'Hosea',
    'Joel': 'Joel', 'Amos': 'Amos', 'Obad': 'Obadiah', 'Jonah': 'Jonah',
    'Mic': 'Micah', 'Nah': 'Nahum', 'Hab': 'Habakkuk', 'Zeph': 'Zephaniah',
    'Hag': 'Haggai', 'Zech': 'Zechariah', 'Mal': 'Malachi',
    'Matt': 'Matthew', 'Mark': 'Mark', 'Luke': 'Luke', 'John': 'John',
    'Acts': 'Acts', 'Rom': 'Romans', '1Cor': '1 Corinthians', '2Cor': '2 Corinthians',
    'Gal': 'Galatians', 'Eph': 'Ephesians', 'Phil': 'Philippians', 'Col': 'Colossians',
    '1Thess': '1 Thessalonians', '2Thess': '2 Thessalonians', '1Tim': '1 Timothy',
    '2Tim': '2 Timothy', 'Titus': 'Titus', 'Phlm': 'Philemon', 'Heb': 'Hebrews',
    'Jas': 'James', '1Pet': '1 Peter', '2Pet': '2 Peter', '1John': '1 John',
    '2John': '2 John', '3John': '3 John', 'Jude': 'Jude', 'Rev': 'Revelation'
};

// Reverse map for creating keys
const BOOK_TO_KEY = {};
for (const [abbrev, full] of Object.entries(BOOK_ABBREV_MAP)) {
    BOOK_TO_KEY[full.toLowerCase()] = abbrev.toLowerCase();
}

/**
 * Parse OpenBible reference format (e.g., "Gen.1.1" or "Gen.1.1-Gen.1.3")
 * @param {string} ref - Reference in OpenBible format
 * @returns {string} - Reference in standard format (e.g., "Genesis 1:1")
 */
function parseReference(ref) {
    // Handle ranges like "Gen.1.1-Gen.1.3" or "Ps.89.11-Ps.89.12"
    if (ref.includes('-')) {
        const parts = ref.split('-');
        const start = parseSingleRef(parts[0]);
        const end = parseSingleRef(parts[1]);

        // If same book and chapter, just show verse range
        const startMatch = start.match(/^(.+) (\d+):(\d+)$/);
        const endMatch = end.match(/^(.+) (\d+):(\d+)$/);

        if (startMatch && endMatch && startMatch[1] === endMatch[1] && startMatch[2] === endMatch[2]) {
            return `${startMatch[1]} ${startMatch[2]}:${startMatch[3]}-${endMatch[3]}`;
        }
        return `${start}-${end}`;
    }
    return parseSingleRef(ref);
}

/**
 * Parse a single reference (not a range)
 */
function parseSingleRef(ref) {
    const parts = ref.split('.');
    if (parts.length < 3) return ref;

    const bookAbbrev = parts[0];
    const chapter = parts[1];
    const verse = parts[2];

    const bookName = BOOK_ABBREV_MAP[bookAbbrev] || bookAbbrev;
    return `${bookName} ${chapter}:${verse}`;
}

/**
 * Create a compact key from OpenBible format reference
 * @param {string} ref - Reference in OpenBible format (e.g., "Gen.1.1")
 * @returns {string} - Compact key (e.g., "gen_1_1")
 */
function createKey(ref) {
    const parts = ref.split('.');
    if (parts.length < 3) return null;
    return `${parts[0].toLowerCase()}_${parts[1]}_${parts[2]}`;
}

async function convertCrossReferences() {
    console.log('===========================================');
    console.log('  Converting Cross-References to JSON');
    console.log('===========================================\n');

    const inputPath = path.join(__dirname, 'cross-references.txt');

    if (!fs.existsSync(inputPath)) {
        console.error('Error: cross-references.txt not found in scripts directory.');
        console.error('Please download from: https://a.openbible.info/data/cross-references.zip');
        console.error('and extract cross-references.txt to the scripts/ directory.');
        process.exit(1);
    }

    const content = fs.readFileSync(inputPath, 'utf-8');
    const lines = content.split('\n');

    // Parse all cross-references, grouped by source verse
    const crossRefs = {};
    let totalRefs = 0;
    let skippedRefs = 0;

    for (const line of lines) {
        // Skip comments and empty lines
        if (line.startsWith('#') || !line.trim()) continue;

        const parts = line.split('\t');
        if (parts.length < 3) continue;

        const [fromRef, toRef, votesStr] = parts;
        const votes = parseInt(votesStr, 10);

        // Skip references with negative or zero votes (low quality)
        if (votes <= 0) {
            skippedRefs++;
            continue;
        }

        const key = createKey(fromRef);
        if (!key) continue;

        const targetRef = parseReference(toRef);

        if (!crossRefs[key]) {
            crossRefs[key] = [];
        }

        crossRefs[key].push({
            ref: targetRef,
            votes: votes
        });
        totalRefs++;
    }

    // Sort each verse's cross-references by votes (descending) and limit to top 8
    const outputData = {};

    let versesWithRefs = 0;
    for (const key of Object.keys(crossRefs)) {
        // Sort by votes descending
        crossRefs[key].sort((a, b) => b.votes - a.votes);

        // Keep top 8 references (just the strings)
        const topRefs = crossRefs[key].slice(0, 8).map(r => r.ref);

        if (topRefs.length > 0) {
            outputData[key] = topRefs;
            versesWithRefs++;
        }
    }

    // Save to data directory (minified JSON - no pretty printing)
    const outputPath = path.join(__dirname, '..', 'data', 'cross-references.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData));

    console.log(`Processed ${totalRefs.toLocaleString()} cross-references`);
    console.log(`Skipped ${skippedRefs.toLocaleString()} low-quality references`);
    console.log(`Created entries for ${versesWithRefs.toLocaleString()} verses`);
    console.log(`\nSaved to: ${outputPath}`);

    // Report file size
    const stats = fs.statSync(outputPath);
    console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    // Also create a separate popular verses file with full formatting
    await createPopularVersesFile(crossRefs);

    console.log('\n===========================================');
}

/**
 * Create a smaller file with just popular/commonly looked up verses
 * These are pre-formatted for instant display
 */
async function createPopularVersesFile(allRefs) {
    // List of popular verses people commonly look up
    const popularVerseKeys = [
        // Genesis
        'gen_1_1', 'gen_1_27', 'gen_3_15',
        // Psalms
        'ps_23_1', 'ps_23_4', 'ps_46_1', 'ps_91_1', 'ps_119_105',
        // Proverbs
        'prov_3_5', 'prov_3_6', 'prov_22_6',
        // Isaiah
        'isa_40_31', 'isa_41_10', 'isa_53_5', 'isa_53_6',
        // Jeremiah
        'jer_29_11',
        // Matthew
        'matt_5_3', 'matt_5_44', 'matt_6_33', 'matt_11_28', 'matt_28_19', 'matt_28_20',
        // Mark
        'mark_16_15',
        // Luke
        'luke_6_31',
        // John
        'john_1_1', 'john_1_14', 'john_3_16', 'john_3_17', 'john_3_36', 'john_10_10',
        'john_11_25', 'john_14_6', 'john_14_27', 'john_15_13',
        // Acts
        'acts_1_8', 'acts_2_38', 'acts_4_12',
        // Romans
        'rom_3_23', 'rom_5_8', 'rom_6_23', 'rom_8_1', 'rom_8_28', 'rom_8_38',
        'rom_10_9', 'rom_10_13', 'rom_12_1', 'rom_12_2',
        // 1 Corinthians
        '1cor_10_13', '1cor_13_4', '1cor_13_13',
        // 2 Corinthians
        '2cor_5_17', '2cor_5_21', '2cor_12_9',
        // Galatians
        'gal_2_20', 'gal_5_22',
        // Ephesians
        'eph_2_8', 'eph_2_9', 'eph_4_32', 'eph_6_11',
        // Philippians
        'phil_4_6', 'phil_4_7', 'phil_4_8', 'phil_4_13', 'phil_4_19',
        // Colossians
        'col_3_23',
        // 1 Thessalonians
        '1thess_5_16', '1thess_5_17', '1thess_5_18',
        // 2 Timothy
        '2tim_1_7', '2tim_3_16',
        // Hebrews
        'heb_4_12', 'heb_11_1', 'heb_11_6', 'heb_12_1', 'heb_12_2', 'heb_13_5', 'heb_13_8',
        // James
        'jas_1_2', 'jas_1_5', 'jas_4_7',
        // 1 Peter
        '1pet_5_7',
        // 1 John
        '1john_1_9', '1john_4_8', '1john_4_19',
        // Revelation
        'rev_3_20', 'rev_21_4'
    ];

    const popularData = {};
    let found = 0;

    for (const key of popularVerseKeys) {
        if (allRefs[key]) {
            // Sort by votes and get top 8
            allRefs[key].sort((a, b) => b.votes - a.votes);
            popularData[key] = allRefs[key].slice(0, 8).map(r => r.ref);
            found++;
        }
    }

    const popularPath = path.join(__dirname, '..', 'data', 'cross-references-popular.json');
    fs.writeFileSync(popularPath, JSON.stringify(popularData, null, 2));

    const stats = fs.statSync(popularPath);
    console.log(`\nCreated popular verses file: ${popularPath}`);
    console.log(`Popular verses found: ${found}/${popularVerseKeys.length}`);
    console.log(`Popular file size: ${(stats.size / 1024).toFixed(2)} KB`);
}

convertCrossReferences().catch(console.error);

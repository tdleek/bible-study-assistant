/**
 * Download Tyndale Bible from getBible API
 *
 * This script downloads William Tyndale's 1525/1530 Bible translation
 * from the getBible API and saves it as a structured JSON file.
 *
 * Tyndale translated:
 * - Old Testament: Pentateuch (Genesis-Deuteronomy) + Jonah
 * - New Testament: Complete (Matthew-Revelation)
 *
 * Run with: node scripts/download-tyndale.js
 */

const fs = require('fs');
const path = require('path');

// Book numbers that Tyndale translated
const TYNDALE_BOOKS = {
  // Old Testament (Pentateuch + Jonah)
  1: 'Genesis',
  2: 'Exodus',
  3: 'Leviticus',
  4: 'Numbers',
  5: 'Deuteronomy',
  32: 'Jonah',
  // New Testament (complete)
  40: 'Matthew',
  41: 'Mark',
  42: 'Luke',
  43: 'John',
  44: 'Acts',
  45: 'Romans',
  46: '1 Corinthians',
  47: '2 Corinthians',
  48: 'Galatians',
  49: 'Ephesians',
  50: 'Philippians',
  51: 'Colossians',
  52: '1 Thessalonians',
  53: '2 Thessalonians',
  54: '1 Timothy',
  55: '2 Timothy',
  56: 'Titus',
  57: 'Philemon',
  58: 'Hebrews',
  59: 'James',
  60: '1 Peter',
  61: '2 Peter',
  62: '1 John',
  63: '2 John',
  64: '3 John',
  65: 'Jude',
  66: 'Revelation'
};

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`  Retry ${i + 1}/${retries}...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function downloadTyndale() {
  console.log('===========================================');
  console.log('  Downloading Tyndale Bible (1525/1530)');
  console.log('===========================================\n');

  const tyndaleData = {
    meta: {
      translation: 'William Tyndale Bible (1525/1530)',
      abbreviation: 'Tyndale',
      language: 'English',
      description: 'William Tyndale\'s English translation - the first English Bible translated directly from Hebrew and Greek texts. Tyndale was martyred before completing the entire Bible.',
      source: 'getBible API (api.getbible.net)',
      downloadedAt: new Date().toISOString(),
      coverage: {
        oldTestament: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Jonah'],
        newTestament: 'Complete (Matthew through Revelation)'
      }
    },
    books: {}
  };

  let totalVerses = 0;

  for (const [bookNum, bookName] of Object.entries(TYNDALE_BOOKS)) {
    console.log(`Downloading ${bookName}...`);

    try {
      // Fetch the entire book
      const url = `https://api.getbible.net/v2/tyndale/${bookNum}.json`;
      const bookData = await fetchWithRetry(url);

      // Initialize book structure
      tyndaleData.books[bookName] = {
        bookNum: parseInt(bookNum),
        chapters: {}
      };

      // Process each chapter (chapters is an array, not an object)
      for (const chapterData of bookData.chapters) {
        const chapterNum = chapterData.chapter;
        tyndaleData.books[bookName].chapters[chapterNum] = {};

        // Process each verse
        for (const verse of chapterData.verses) {
          tyndaleData.books[bookName].chapters[chapterNum][verse.verse] = verse.text.trim();
          totalVerses++;
        }
      }

      const chapterCount = Object.keys(tyndaleData.books[bookName].chapters).length;
      console.log(`  ✓ ${bookName}: ${chapterCount} chapters`);

      // Small delay to be respectful to the API
      await new Promise(r => setTimeout(r, 200));

    } catch (error) {
      console.error(`  ✗ Error downloading ${bookName}: ${error.message}`);
    }
  }

  // Save to file
  const outputPath = path.join(__dirname, '..', 'data', 'tyndale.json');
  fs.writeFileSync(outputPath, JSON.stringify(tyndaleData, null, 2));

  console.log('\n===========================================');
  console.log(`  Download complete!`);
  console.log(`  Total verses: ${totalVerses}`);
  console.log(`  Saved to: ${outputPath}`);
  console.log('===========================================');
}

downloadTyndale().catch(console.error);

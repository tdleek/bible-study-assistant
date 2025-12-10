// /api/research-agent.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { question, translation = 'ESV', versesOnly = false, plan: existingPlan = null } = req.body;

    // If versesOnly mode, just refetch the verses with the new translation
    if (versesOnly && existingPlan?.verses) {
        try {
            const research = { verses: [], context: [], crossReferences: [] };

            for (const verseRef of existingPlan.verses) {
                try {
                    const verseData = await fetchVerseText(verseRef, translation);
                    if (verseData) {
                        research.verses.push({
                            reference: verseRef,
                            text: verseData
                        });
                    }
                } catch (e) {
                    console.error(`Failed to fetch ${verseRef}:`, e);
                }
            }

            return res.status(200).json({ research });
        } catch (error) {
            console.error('Verse refetch error:', error);
            return res.status(500).json({ error: 'Failed to refetch verses' });
        }
    }

    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    try {
        // Step 1: Ask AI to create a research plan
        const plan = await createResearchPlan(question);

        // Step 2: Execute the plan (fetch from various tools)
        const research = await executeResearchPlan(plan, translation);

        // Step 3: Synthesize into final answer
        const answer = await synthesizeAnswer(question, research);

        return res.status(200).json({
            question,
            plan,
            research,
            answer
        });
    } catch (error) {
        console.error('Research agent error:', error);
        return res.status(500).json({ error: 'Research failed' });
    }
}

async function createResearchPlan(question) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{
                role: 'system',
                content: `You are a Bible research planner. Given a question, identify what information is needed to answer it comprehensively.

Return ONLY a JSON object (no other text):
{
    "verses": ["John 3:16", "Genesis 22:1-2"],
    "needsContext": true,
    "needsOriginalLanguage": true,
    "needsCrossReferences": true,
    "searchTerms": ["sacrifice", "only son"],
    "approach": "Brief explanation of research strategy"
}

Be selective — only include verses directly relevant to the question. Maximum 4 verses.`
            }, {
                role: 'user',
                content: question
            }],
            temperature: 0.3,
            max_tokens: 500
        })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
        console.error('Failed to parse research plan:', e);
        return null;
    }
}

async function executeResearchPlan(plan, translation) {
    const research = {
        verses: [],
        context: [],
        crossReferences: []
    };

    if (!plan) return research;

    // Fetch verse texts
    for (const verseRef of plan.verses || []) {
        try {
            const verseData = await fetchVerseText(verseRef, translation);
            if (verseData) {
                research.verses.push({
                    reference: verseRef,
                    text: verseData
                });
            }
        } catch (e) {
            console.error(`Failed to fetch ${verseRef}:`, e);
        }
    }

    // Get context for primary verses (limit to 2)
    if (plan.needsContext && plan.verses?.length > 0) {
        for (const verseRef of plan.verses.slice(0, 2)) {
            try {
                const context = await fetchContext(verseRef, translation);
                if (context) {
                    research.context.push({
                        reference: verseRef,
                        context: context
                    });
                }
            } catch (e) {
                console.error(`Failed to get context for ${verseRef}:`, e);
            }
        }
    }

    return research;
}

async function fetchVerseText(ref, translation) {
    // Parse reference like "John 3:16" or "Genesis 22:1-2"
    const match = ref.match(/^(\d?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/);
    if (!match) return null;

    const book = match[1].trim();
    const chapter = match[2];
    const verseStart = match[3];
    const verseEnd = match[4] || verseStart;

    // Map book names to bolls.life format
    const bookMap = {
        'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
        'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
        '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH',
        'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA', 'Psalm': 'PSA',
        'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA',
        'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN',
        'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON',
        'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP',
        'Haggai': 'HAG', 'Zechariah': 'ZEC', 'Malachi': 'MAL',
        'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN',
        'Acts': 'ACT', 'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO',
        'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
        '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI',
        'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS',
        '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN', '3 John': '3JN',
        'Jude': 'JUD', 'Revelation': 'REV'
    };

    const bookCode = bookMap[book];
    if (!bookCode) return null;

    try {
        const response = await fetch(
            `https://bolls.life/get-text/${translation}/${bookCode}/${chapter}/`
        );
        if (!response.ok) return null;

        const verses = await response.json();
        const selectedVerses = verses.filter(v =>
            v.verse >= parseInt(verseStart) && v.verse <= parseInt(verseEnd)
        );

        return selectedVerses.map(v => v.text).join(' ');
    } catch (e) {
        console.error('Verse fetch error:', e);
        return null;
    }
}

async function fetchContext(ref, translation) {
    // Use AI to generate context (similar to Go Deeper but lighter)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{
                role: 'system',
                content: `Provide brief historical and cultural context for Bible verses. Be concise (2-3 sentences). Focus on what helps understand the passage's meaning.`
            }, {
                role: 'user',
                content: `Provide context for ${ref}`
            }],
            temperature: 0.5,
            max_tokens: 200
        })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
}

async function synthesizeAnswer(question, research) {
    const researchSummary = JSON.stringify(research, null, 2);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{
                role: 'system',
                content: `You are a Bible scholar synthesizing research into a comprehensive answer.

Research gathered:
${researchSummary}

Using this research, provide a thorough but accessible answer. Include:
- Direct references to the verses studied
- Historical/cultural context where relevant
- Connections between passages
- Practical application

Be specific and cite the research. Write in a warm, educational tone.`
            }, {
                role: 'user',
                content: question
            }],
            temperature: 0.7,
            max_tokens: 1500
        })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to synthesize research.';
}

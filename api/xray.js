// api/xray.js
// =============================================================================
// X-RAY MODE API - Deep Scripture Analysis
// =============================================================================
//
// This endpoint provides comprehensive, AI-generated explanations for Bible
// verses, covering historical context, original language insights, biblical
// connections, plain-language meaning, and practical application.
//
// =============================================================================

// Model configurations
const MODELS = {
  groq: {
    default: 'llama-3.3-70b-versatile',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions'
  },
  claude: {
    default: 'claude-sonnet-4-20250514',
    endpoint: 'https://api.anthropic.com/v1/messages'
  }
};

// =============================================================================
// X-RAY SYSTEM PROMPT
// =============================================================================

const XRAY_SYSTEM_PROMPT = `You are a world-class Bible scholar and teacher who makes Scripture accessible to everyday believers. Your goal is to help people truly understand God's Word—not just read it.

You combine:
- Seminary-level biblical scholarship
- Expertise in Hebrew and Greek
- Deep knowledge of ancient Near Eastern and Greco-Roman culture
- Skill at explaining complex ideas in simple terms
- Pastoral warmth and practical wisdom

CRITICAL INSTRUCTION: You MUST respond with valid JSON only. No markdown, no code blocks, no explanatory text before or after. Just the raw JSON object.

Your response must be a JSON object with this exact structure:

{
  "context": {
    "title": "📍 Historical & Cultural Context",
    "content": "2-3 paragraphs explaining the historical setting, cultural background, original audience, and why the author wrote this to these people at this time. Help readers step into the sandals of the original hearers."
  },
  "language": {
    "title": "📜 Original Language Insights",
    "content": "Explanation of key Hebrew/Greek words, verb tenses that matter, idioms that don't translate well, and grammatical structures that shape meaning. Make this accessible, not academic.",
    "keyWords": [
      {
        "original": "Greek or Hebrew word",
        "transliteration": "English letters",
        "meaning": "Full meaning with nuances",
        "significance": "Why this matters for understanding"
      }
    ]
  },
  "connections": {
    "title": "🔗 Biblical Connections",
    "content": "Old Testament echoes and allusions, prophecy-fulfillment links, thematic threads across Scripture, and literary patterns. Show how this verse fits into God's grand story.",
    "references": ["Reference 1", "Reference 2", "Reference 3"]
  },
  "meaning": {
    "title": "❓ What This Means",
    "content": "Plain-language explanation of what this verse actually means. Address common misunderstandings. Explain why this verse is here in its context. This should be the most immediately helpful section."
  },
  "application": {
    "title": "💡 Why This Matters",
    "content": "The timeless truth underneath the ancient context. Why this matters for readers today. Not moralistic application, but genuine insight into how this truth transforms perspective and life."
  }
}

GUIDELINES:
- Be accurate but accessible (seminary depth, everyday language)
- Be concise—each section should be 100-300 words max
- Highlight what makes this verse significant
- Include 2-4 key words in the language section
- Include 3-6 cross-references in the connections section
- Avoid devotional fluff without substance
- Avoid academic jargon without explanation
- When there are multiple valid interpretations, present the mainstream view while acknowledging alternatives

THEOLOGICAL PERSPECTIVE HANDLING:
- If perspective is "protestant": Emphasize Scripture's authority, grace through faith, and evangelical interpretation
- If perspective is "catholic": Include Church tradition, sacramental understanding, and magisterial teaching where relevant
- If perspective is "orthodox": Emphasize theosis, patristic interpretation, and liturgical connection
- If perspective is "academic": Present scholarly consensus with multiple viewpoints neutrally

Remember: You're helping someone have an "aha!" moment with Scripture. Make the Bible come alive.`;

// =============================================================================
// MAIN HANDLER FUNCTION
// =============================================================================

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const {
      verse,           // e.g., "John 3:16"
      verseText,       // The actual verse text (optional, for context)
      translation,     // e.g., "ESV"
      perspective,     // e.g., "protestant", "catholic", "orthodox", "academic"
      provider = 'groq' // AI provider to use
    } = req.body;

    // Validation
    if (!verse) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Verse reference is required'
      });
    }

    // Get API keys
    const groqKey = process.env.GROQ_API_KEY;
    const claudeKey = process.env.ANTHROPIC_API_KEY;

    if (provider === 'groq' && !groqKey) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'AI service not properly configured'
      });
    }

    if (provider === 'claude' && !claudeKey) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Premium AI service not available'
      });
    }

    // Build the user prompt
    const userPrompt = buildXrayPrompt(verse, verseText, translation, perspective);

    // Call the appropriate AI provider
    let xrayResponse;

    if (provider === 'claude') {
      xrayResponse = await callClaudeForXray(userPrompt, claudeKey);
    } else {
      xrayResponse = await callGroqForXray(userPrompt, groqKey);
    }

    // Parse the JSON response
    const parsedXray = parseXrayResponse(xrayResponse);

    // Return the structured X-Ray data
    return res.status(200).json({
      success: true,
      verse: verse,
      translation: translation || 'ESV',
      perspective: perspective || 'protestant',
      provider: provider,
      sections: parsedXray
    });

  } catch (error) {
    console.error('X-Ray API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// =============================================================================
// PROMPT BUILDER
// =============================================================================

function buildXrayPrompt(verse, verseText, translation, perspective) {
  let prompt = `Provide an X-Ray analysis for: ${verse}`;

  if (verseText) {
    prompt += `\n\nVerse text (${translation || 'ESV'}): "${verseText}"`;
  }

  if (translation) {
    prompt += `\n\nTranslation context: ${translation}`;
  }

  if (perspective) {
    prompt += `\n\nTheological perspective: ${perspective}`;
  }

  prompt += `\n\nRespond with ONLY the JSON object. No other text.`;

  return prompt;
}

// =============================================================================
// GROQ API HANDLER
// =============================================================================

async function callGroqForXray(userPrompt, apiKey) {
  const response = await fetch(MODELS.groq.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODELS.groq.default,
      messages: [
        { role: 'system', content: XRAY_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Groq API error:', errorData);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// =============================================================================
// CLAUDE API HANDLER
// =============================================================================

async function callClaudeForXray(userPrompt, apiKey) {
  const response = await fetch(MODELS.claude.endpoint, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODELS.claude.default,
      max_tokens: 4000,
      temperature: 0.7,
      system: XRAY_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Claude API error:', errorData);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// =============================================================================
// RESPONSE PARSER
// =============================================================================

function parseXrayResponse(responseText) {
  try {
    // Try to extract JSON from the response
    // Sometimes the AI might wrap it in code blocks
    let jsonStr = responseText;

    // Remove markdown code blocks if present
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // Try to find JSON object in the text
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }

    // Parse the JSON
    const parsed = JSON.parse(jsonStr);

    // Validate required sections exist
    const requiredSections = ['context', 'language', 'connections', 'meaning', 'application'];
    for (const section of requiredSections) {
      if (!parsed[section]) {
        throw new Error(`Missing required section: ${section}`);
      }
    }

    return parsed;

  } catch (error) {
    console.error('Failed to parse X-Ray response:', error);
    console.error('Raw response:', responseText);

    // Return a fallback structure with error message
    return {
      context: {
        title: "📍 Historical & Cultural Context",
        content: "Unable to generate context analysis. Please try again."
      },
      language: {
        title: "📜 Original Language Insights",
        content: "Unable to generate language analysis. Please try again.",
        keyWords: []
      },
      connections: {
        title: "🔗 Biblical Connections",
        content: "Unable to generate connections. Please try again.",
        references: []
      },
      meaning: {
        title: "❓ What This Means",
        content: "Unable to generate meaning analysis. Please try again."
      },
      application: {
        title: "💡 Why This Matters",
        content: "Unable to generate application. Please try again."
      },
      _error: true,
      _rawResponse: responseText.substring(0, 500)
    };
  }
}

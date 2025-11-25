// api/study-plan.js
// =============================================================================
// AI-POWERED BIBLE STUDY PLAN GENERATOR
// =============================================================================
//
// This endpoint generates personalized Bible study plans based on user topics.
// It uses the existing AI infrastructure to create structured study content.
//
// USAGE: POST /api/study-plan
// Body: { topic: "anxiety", duration: 7, translation: "ESV" }
//
// RETURNS: Array of daily study objects with verses, reflections, and prayers
//
// =============================================================================

// Model configuration (same as chat.js)
const MODELS = {
  groq: {
    default: 'llama-3.3-70b-versatile',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions'
  }
};

// =============================================================================
// MAIN HANDLER
// =============================================================================

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { topic, duration = 7, translation = 'ESV' } = req.body;

    // Validate inputs
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Topic is required'
      });
    }

    if (duration < 3 || duration > 30) {
      return res.status(400).json({
        error: 'Invalid duration',
        message: 'Duration must be between 3 and 30 days'
      });
    }

    // Get API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('GROQ_API_KEY not configured');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'AI service not properly configured'
      });
    }

    // Generate the study plan
    console.log(`\n========== STUDY PLAN REQUEST ==========`);
    console.log(`Topic: ${topic}`);
    console.log(`Duration: ${duration} days`);
    console.log(`Translation: ${translation}`);

    const studyPlan = await generateStudyPlan(topic.trim(), duration, translation, apiKey);

    console.log(`✅ Generated ${studyPlan.length} day plan`);

    return res.status(200).json({
      success: true,
      topic: topic.trim(),
      duration,
      translation,
      plan: studyPlan
    });

  } catch (error) {
    console.error('Study plan error:', error);
    return res.status(500).json({
      error: 'Failed to generate study plan',
      message: error.message
    });
  }
}

// =============================================================================
// STUDY PLAN GENERATOR
// =============================================================================

async function generateStudyPlan(topic, duration, translation, apiKey) {
  const systemPrompt = `You are a knowledgeable Bible study guide creating personalized study plans. Your plans are spiritually enriching, biblically accurate, and practical.

IMPORTANT: You MUST respond with ONLY a valid JSON array. No markdown, no code blocks, no explanation - just the raw JSON array.

Create a ${duration}-day Bible study plan on the topic: "${topic}"

Each day in the array must have this exact structure:
{
  "day": 1,
  "title": "Short inspiring title for this day's study",
  "verses": ["Book Chapter:Verse", "Book Chapter:Verse"],
  "focus": "2-3 sentence focus for what to pay attention to while reading",
  "reflection": "3-4 thought-provoking questions or points for personal reflection",
  "prayer": "A short prayer related to the day's theme (2-3 sentences)"
}

Guidelines:
- Use the ${translation} translation for verse references
- Include 2-4 relevant Bible verses per day
- Build progressively - start with foundational concepts, go deeper
- Make reflections personal and actionable
- Prayers should be heartfelt and specific to the topic
- Vary the books of the Bible used (mix Old and New Testament where appropriate)
- Ensure verse references are accurate and exist in the Bible

Return ONLY the JSON array with ${duration} day objects. No other text.`;

  const userPrompt = `Generate a ${duration}-day Bible study plan about "${topic}". Return only the JSON array.`;

  try {
    const response = await fetch(MODELS.groq.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODELS.groq.default,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI service');
    }

    // Extract JSON from response (handle markdown code blocks if present)
    const studyPlan = extractJSON(content);

    // Validate the structure
    if (!Array.isArray(studyPlan)) {
      throw new Error('Invalid response format - expected array');
    }

    // Validate each day has required fields
    for (let i = 0; i < studyPlan.length; i++) {
      const day = studyPlan[i];
      if (!day.day || !day.title || !day.verses || !day.focus || !day.reflection || !day.prayer) {
        console.warn(`Day ${i + 1} missing fields, attempting to fix...`);
        // Fill in missing fields with defaults
        day.day = day.day || i + 1;
        day.title = day.title || `Day ${i + 1} Study`;
        day.verses = day.verses || [];
        day.focus = day.focus || 'Focus on understanding the passage in context.';
        day.reflection = day.reflection || 'How does this passage apply to your life today?';
        day.prayer = day.prayer || 'Lord, help me understand and apply Your Word. Amen.';
      }
      // Ensure verses is an array
      if (!Array.isArray(day.verses)) {
        day.verses = [day.verses].filter(Boolean);
      }
    }

    return studyPlan;

  } catch (error) {
    console.error('Error generating study plan:', error);
    throw error;
  }
}

// =============================================================================
// JSON EXTRACTION HELPER
// =============================================================================

function extractJSON(text) {
  // First, try to parse as-is (ideal case)
  try {
    return JSON.parse(text);
  } catch (e) {
    // Not valid JSON, try to extract it
  }

  // Try to extract JSON from markdown code blocks
  // Pattern: ```json ... ``` or ``` ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {
      // Continue to other methods
    }
  }

  // Try to find array brackets and extract
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch (e) {
      // Continue to other methods
    }
  }

  // Try to find object and wrap in array
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      const obj = JSON.parse(objectMatch[0]);
      return Array.isArray(obj) ? obj : [obj];
    } catch (e) {
      // Give up
    }
  }

  throw new Error('Could not extract valid JSON from AI response');
}

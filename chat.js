// =============================================================================
// SERVERLESS API ENDPOINT - api/chat.js
// =============================================================================
// This is a "serverless function" - it runs on Vercel's servers, not in the browser.
// Why do we need this? To hide our API key from users!
//
// HOW IT WORKS:
// 1. User's browser sends question to YOUR server (this file)
// 2. This file calls Groq API with YOUR secret key
// 3. This file sends response back to user's browser
//
// The user NEVER sees your API key! 🔒
// =============================================================================

export default async function handler(req, res) {
  // =============================================================================
  // CORS HEADERS - Allow your frontend to talk to this API
  // =============================================================================
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY not found');
      return res.status(500).json({ 
        error: 'Server configuration error - API key not set' 
      });
    }

    // =============================================================================
    // GET DATA FROM USER'S REQUEST
    // =============================================================================
    const { messages, selectedTranslation } = req.body || {};
    
    // Debug logging
    console.log('Request body:', JSON.stringify(req.body));
    console.log('Messages received:', messages ? messages.length : 'none');

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Messages array required',
        received: typeof req.body,
        body: req.body
      });
    }

    // =============================================================================
    // CALL GROQ API (FROM OUR SERVER)
    // =============================================================================
    // This is the same API call as before, but now it happens on OUR server
    // The user never sees the API key!
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}` // 🔒 Secret key used here
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      console.error('Groq API error:', errorData);
      return res.status(groqResponse.status).json({
        error: errorData.error?.message || 'Groq API error'
      });
    }

    // =============================================================================
    // SEND RESPONSE BACK TO USER
    // =============================================================================
    const data = await groqResponse.json();
    
    // Validate response has expected structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected Groq response structure:', JSON.stringify(data));
      return res.status(500).json({
        error: 'Unexpected response from AI service',
        details: data
      });
    }
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

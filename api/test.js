// =============================================================================
// DEBUG ENDPOINT - api/test.js
// =============================================================================
// This checks if your API key is configured correctly
// Access it at: yoursite.com/api/test
// DELETE THIS FILE after debugging!
// =============================================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  // Check if key exists
  if (!GROQ_API_KEY) {
    return res.status(200).json({
      status: 'ERROR',
      message: 'GROQ_API_KEY is NOT set in environment variables',
      hint: 'Go to Vercel → Settings → Environment Variables → Add GROQ_API_KEY'
    });
  }
  
  // Check key format
  if (!GROQ_API_KEY.startsWith('gsk_')) {
    return res.status(200).json({
      status: 'ERROR', 
      message: 'GROQ_API_KEY does not start with gsk_',
      keyStart: GROQ_API_KEY.substring(0, 4) + '...',
      hint: 'Groq API keys should start with gsk_'
    });
  }
  
  // Try a simple API call
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say "API working!" and nothing else.' }],
        max_tokens: 20
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(200).json({
        status: 'ERROR',
        message: 'Groq API rejected the request',
        groqError: data.error || data,
        hint: 'Your API key might be invalid or expired. Get a new one at console.groq.com'
      });
    }
    
    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Everything is working!',
      aiResponse: data.choices[0]?.message?.content || 'No response',
      hint: 'Your API is configured correctly. The main chat should work now.'
    });
    
  } catch (error) {
    return res.status(200).json({
      status: 'ERROR',
      message: 'Failed to call Groq API',
      error: error.message,
      hint: 'Network or configuration issue'
    });
  }
}

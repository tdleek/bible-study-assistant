// api/chat.js
// =============================================================================
// MULTI-PROVIDER AI BACKEND FOR BIBLE STUDY ASSISTANT
// =============================================================================
//
// This is a SERVERLESS FUNCTION - runs on-demand in the cloud
// Think of it like a vending machine: sits idle until someone makes a request,
// then springs to life, does its job, and goes back to sleep.
//
// WHY SERVERLESS?
// - You only pay for actual usage (execution time)
// - Automatically scales (1 user or 1000 users, no config needed)
// - No server maintenance
// - Perfect for API proxy patterns like this
//
// WHAT THIS FILE DOES:
// 1. Receives chat messages from your frontend
// 2. Determines which AI provider to use (Groq or Claude)
// 3. Calls the appropriate AI API with YOUR secret key
// 4. Returns the AI response to the user
//
// KEY LEARNING CONCEPTS:
// - Environment variables (secrets management)
// - API abstraction (supporting multiple providers)
// - Error handling (graceful failures)
// - CORS (letting your frontend talk to backend)
// - Request validation (never trust user input)
//
// =============================================================================

// =============================================================================
// CONFIGURATION
// =============================================================================

// Model configurations - this makes it easy to add/change models
const MODELS = {
  // Groq models (FREE) - good quality, fast
  groq: {
    default: 'llama-3.3-70b-versatile',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    alternatives: [
      'llama-3.2-90b-text-preview',
      'llama-3.1-70b-versatile'
    ]
  },
  
  // Anthropic models (PAID) - excellent quality for theology
  claude: {
    default: 'claude-sonnet-4-20250514',
    endpoint: 'https://api.anthropic.com/v1/messages',
    alternatives: [
      'claude-3-5-sonnet-20241022',  // Latest Sonnet
      'claude-3-5-haiku-20241022'     // Faster, cheaper
    ]
  }
};

// =============================================================================
// MAIN HANDLER FUNCTION
// =============================================================================

export default async function handler(req, res) {
  // ---------------------------------------------------------------------------
  // CORS HEADERS
  // ---------------------------------------------------------------------------
  // CORS = Cross-Origin Resource Sharing
  // This tells browsers: "Yes, my frontend website can talk to this backend"
  // Without this, browsers block the request for security
  //
  // '*' means any domain can call this - fine for public API
  // In production, you might restrict to your domain only
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Version');
  
  // ---------------------------------------------------------------------------
  // PREFLIGHT REQUEST HANDLING
  // ---------------------------------------------------------------------------
  // Browsers send an OPTIONS request first to check if the real request is allowed
  // This is called a "preflight request"
  // We just say "yes, proceed" and end
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ---------------------------------------------------------------------------
  // METHOD VALIDATION
  // ---------------------------------------------------------------------------
  // Only accept POST requests
  // GET requests would expose data in URL (bad for privacy/security)
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  // ---------------------------------------------------------------------------
  // REQUEST PARSING & VALIDATION
  // ---------------------------------------------------------------------------
  try {
    // Extract data from the request body
    const { messages, provider = 'groq', model } = req.body;

    // VALIDATION: Never trust user input!
    // Check that messages is an array and not empty
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Messages array is required and must not be empty'
      });
    }

    // Validate provider choice
    if (!['groq', 'claude'].includes(provider)) {
      return res.status(400).json({
        error: 'Invalid provider',
        message: 'Provider must be either "groq" or "claude"'
      });
    }

    // ---------------------------------------------------------------------------
    // ENVIRONMENT VARIABLES - SECRET MANAGEMENT
    // ---------------------------------------------------------------------------
    // process.env reads from Vercel's secure environment storage
    // These are set in Vercel dashboard, NEVER in your code
    // 
    // WHY THIS MATTERS:
    // - API keys are like passwords - exposing them = anyone can use your account
    // - If someone gets your key, they can rack up charges or abuse the API
    // - Environment variables keep secrets OUT of your code/GitHub
    //
    // VERCEL MAKES THIS SECURE:
    // - Keys are encrypted at rest
    // - Only your serverless functions can access them
    // - Never exposed to the frontend/browser
    const groqKey = process.env.GROQ_API_KEY;
    const claudeKey = process.env.ANTHROPIC_API_KEY;

    // Check that we have the required key for the chosen provider
    if (provider === 'groq' && !groqKey) {
      console.error('GROQ_API_KEY not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'AI service not properly configured'
      });
    }

    if (provider === 'claude' && !claudeKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Premium AI service not available'
      });
    }

    // ---------------------------------------------------------------------------
    // ROUTE TO CORRECT PROVIDER
    // ---------------------------------------------------------------------------
    // This is called "abstraction" - the frontend doesn't need to know
    // which AI provider is being used or how to call it
    // This backend handles all the complexity
    
    let aiResponse;
    
    if (provider === 'groq') {
      aiResponse = await callGroqAPI(messages, groqKey, model);
    } else if (provider === 'claude') {
      aiResponse = await callClaudeAPI(messages, claudeKey, model);
    }

    // Return the AI response to the frontend
    return res.status(200).json(aiResponse);

  } catch (error) {
    // Catch any unexpected errors
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// =============================================================================
// GROQ API HANDLER
// =============================================================================

async function callGroqAPI(messages, apiKey, modelOverride) {
  // Determine which model to use
  // If user specified a model, use that; otherwise use default
  const modelToUse = modelOverride || MODELS.groq.default;

  try {
    // Call Groq API
    // Groq uses OpenAI-compatible format, making it easy to switch
    const response = await fetch(MODELS.groq.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: messages,
        temperature: 0.7,  // 0.0 = deterministic, 1.0 = creative, 0.7 = balanced
        max_tokens: 2000,  // Maximum length of response
        top_p: 0.9,        // Nucleus sampling - keeps responses focused
      }),
    });

    // Check if the API call was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    // Parse and return the response
    const data = await response.json();
    
    // Return in a standardized format
    // This makes it easier to handle different providers consistently
    return {
      provider: 'groq',
      model: modelToUse,
      message: data.choices[0].message.content,
      usage: data.usage,  // Token usage stats
      raw: data           // Include full response for debugging
    };

  } catch (error) {
    console.error('Error calling Groq:', error);
    throw error;
  }
}

// =============================================================================
// CLAUDE API HANDLER
// =============================================================================

async function callClaudeAPI(messages, apiKey, modelOverride) {
  // Determine which model to use
  const modelToUse = modelOverride || MODELS.claude.default;

  try {
    // ---------------------------------------------------------------------------
    // MESSAGE FORMAT CONVERSION
    // ---------------------------------------------------------------------------
    // Claude's API format is different from OpenAI/Groq
    // We need to convert the messages to Claude's expected format
    //
    // OpenAI format: [{ role: 'system', content: '...' }, { role: 'user', content: '...' }]
    // Claude format: system prompt separate + messages array without system role
    
    // Extract system message if it exists
    let systemPrompt = '';
    const claudeMessages = [];
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        // Claude wants system prompt as a separate parameter
        systemPrompt = msg.content;
      } else {
        // User and assistant messages go in the messages array
        claudeMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    // Build the request body
    const requestBody = {
      model: modelToUse,
      max_tokens: 2000,
      temperature: 0.7,
      messages: claudeMessages
    };

    // Add system prompt if we have one
    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }

    // Call Claude API
    const response = await fetch(MODELS.claude.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,              // Claude uses x-api-key header
        'anthropic-version': '2023-06-01', // API version
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the API call was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      throw new Error(`Claude API error: ${response.status}`);
    }

    // Parse the response
    const data = await response.json();
    
    // ---------------------------------------------------------------------------
    // RESPONSE FORMAT CONVERSION
    // ---------------------------------------------------------------------------
    // Convert Claude's response format to match Groq's format
    // This way our frontend can handle both providers identically
    //
    // Claude response: { content: [{ text: '...' }], usage: {...} }
    // Our format: { message: '...', usage: {...} }
    
    return {
      provider: 'claude',
      model: modelToUse,
      message: data.content[0].text,  // Extract text from Claude's format
      usage: data.usage,              // Token usage stats
      raw: data                       // Include full response for debugging
    };

  } catch (error) {
    console.error('Error calling Claude:', error);
    throw error;
  }
}

// =============================================================================
// EDUCATIONAL NOTES
// =============================================================================
//
// KEY CONCEPTS YOU'VE LEARNED:
//
// 1. SERVERLESS FUNCTIONS
//    - Run on-demand, scale automatically
//    - Perfect for API proxies
//    - Cost-effective (pay per execution)
//
// 2. ENVIRONMENT VARIABLES
//    - Store secrets securely
//    - Never commit to GitHub
//    - Set in Vercel dashboard
//
// 3. API ABSTRACTION
//    - Support multiple providers with one interface
//    - Frontend doesn't need to know implementation details
//    - Easy to add new providers later
//
// 4. ERROR HANDLING
//    - Always validate user input
//    - Catch and log errors properly
//    - Return helpful error messages
//
// 5. CORS
//    - Required for frontend-backend communication
//    - Security feature of browsers
//    - Configure properly for your domain
//
// NEXT STEPS:
// - Deploy this to Vercel
// - Set environment variables in Vercel dashboard
// - Test both providers
// - Add more features (model selection, usage tracking, etc.)
//
// =============================================================================

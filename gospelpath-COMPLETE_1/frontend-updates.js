// =============================================================================
// UPDATED JAVASCRIPT FOR MODEL SWITCHING
// =============================================================================
// Add this to your existing index.html file
// This replaces your current sendMessage() function and adds model selection
// =============================================================================

// =============================================================================
// GLOBAL STATE
// =============================================================================
// Keep track of which AI provider is currently selected
let currentProvider = 'groq';  // Default to free Groq
let currentModel = null;        // null = use provider's default model

// =============================================================================
// UPDATED SEND MESSAGE FUNCTION
// =============================================================================

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Add user message to UI
    addMessage(message, 'user');
    userInput.value = '';
    
    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: message
    });
    
    // Show loading indicator with current provider info
    const providerLabel = currentProvider === 'groq' ? 'Llama' : 'Claude';
    const loadingDiv = addMessage(`${providerLabel} is thinking...`, 'assistant');
    
    try {
        // =======================================================================
        // KEY CHANGE: Call YOUR backend instead of Groq directly
        // =======================================================================
        // This keeps your API key secret on the server
        // The backend decides which AI provider to use based on your selection
        //
        // REQUEST PAYLOAD:
        // - messages: full conversation history (for context)
        // - provider: which AI to use ('groq' or 'claude')
        // - model: (optional) specific model to use
        //
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: conversationHistory,
                provider: currentProvider,
                model: currentModel
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Parse the response from YOUR backend
        // Your backend returns a standardized format regardless of provider
        const data = await response.json();
        const assistantMessage = data.message;  // Standardized across providers
        
        // Remove loading, add real response
        loadingDiv.remove();
        addMessage(assistantMessage, 'assistant');
        
        // Add to history
        conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
        });
        
        // Optional: Show token usage (helpful for learning/debugging)
        if (data.usage) {
            console.log(`Tokens used - Input: ${data.usage.prompt_tokens}, Output: ${data.usage.completion_tokens}`);
        }
        
    } catch (error) {
        loadingDiv.remove();
        addMessage(`Sorry, there was an error: ${error.message}`, 'assistant', 'error');
        console.error('Error:', error);
    }
}

// =============================================================================
// MODEL SWITCHING FUNCTIONS
// =============================================================================

function switchToGroq() {
    currentProvider = 'groq';
    currentModel = null;  // Use default model
    updateProviderUI();
    console.log('Switched to Groq (Llama) - FREE');
}

function switchToClaude() {
    currentProvider = 'claude';
    currentModel = null;  // Use default model
    updateProviderUI();
    console.log('Switched to Claude (Premium) - PAID');
}

function updateProviderUI() {
    // Update button states to show which is active
    const groqBtn = document.getElementById('groq-btn');
    const claudeBtn = document.getElementById('claude-btn');
    
    if (currentProvider === 'groq') {
        groqBtn.classList.add('active');
        claudeBtn.classList.remove('active');
    } else {
        claudeBtn.classList.add('active');
        groqBtn.classList.remove('active');
    }
    
    // Update status indicator
    const statusDiv = document.getElementById('provider-status');
    if (statusDiv) {
        const providerName = currentProvider === 'groq' ? 'Llama (Free)' : 'Claude (Premium)';
        statusDiv.textContent = `Using: ${providerName}`;
    }
}

// =============================================================================
// ADD THIS HTML TO YOUR BODY (before the chat interface)
// =============================================================================
/*

<!-- AI Provider Selector (for testing) -->
<div class="provider-selector" style="background: #f0f0f0; padding: 15px; margin: 20px; border-radius: 8px;">
    <h3 style="margin-top: 0;">AI Model Selection (Testing)</h3>
    <p style="font-size: 14px; color: #666;">Compare different AI models for your Bible study:</p>
    
    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
        <button id="groq-btn" onclick="switchToGroq()" class="provider-btn active" style="flex: 1; padding: 10px; border: 2px solid #4CAF50; border-radius: 5px; background: white; cursor: pointer;">
            <strong>Llama (Groq)</strong><br>
            <small>FREE • Fast • Good Quality</small>
        </button>
        
        <button id="claude-btn" onclick="switchToClaude()" class="provider-btn" style="flex: 1; padding: 10px; border: 2px solid #ddd; border-radius: 5px; background: white; cursor: pointer;">
            <strong>Claude (Anthropic)</strong><br>
            <small>Premium • Excellent Theology</small>
        </button>
    </div>
    
    <div id="provider-status" style="font-size: 14px; color: #666;">
        Using: Llama (Free)
    </div>
</div>

<!-- CSS for button states -->
<style>
.provider-btn.active {
    border-color: #4CAF50 !important;
    background: #f0fff0 !important;
}

.provider-btn:hover {
    background: #f5f5f5 !important;
}
</style>

*/

// =============================================================================
// EDUCATIONAL NOTES
// =============================================================================
//
// WHAT YOU'VE LEARNED:
//
// 1. BACKEND PROXY PATTERN
//    - Frontend calls YOUR backend (not AI directly)
//    - Backend keeps API keys secret
//    - Backend handles complexity of multiple providers
//
// 2. STATE MANAGEMENT
//    - currentProvider tracks which AI to use
//    - Changes don't affect conversation history
//    - Easy to switch mid-conversation
//
// 3. API REQUEST STRUCTURE
//    - Send full conversation history (for context)
//    - Specify provider
//    - Backend returns standardized format
//
// 4. USER EXPERIENCE
//    - Clear indication of which AI is responding
//    - Easy switching between models
//    - Helpful for comparing quality
//
// TESTING WORKFLOW:
// 1. Ask the same question to Llama (Groq)
// 2. Switch to Claude
// 3. Ask the same question
// 4. Compare the responses
// 5. Learn the quality differences
//
// PRODUCTION READY:
// - For public launch, default to Groq (free)
// - Hide Claude selector (or put behind login)
// - Add later as "Premium" feature
//
// =============================================================================

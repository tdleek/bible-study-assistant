# Qwen-Code: Local AI Coding Assistant Setup Guide

Complete guide for running Qwen2.5-Coder locally on M1 MacBook (16GB RAM)

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Usage Guide](#usage-guide)
4. [Model Comparison](#model-comparison)
5. [Performance Optimization](#performance-optimization)
6. [Troubleshooting](#troubleshooting)
7. [Testing Framework](#testing-framework)

---

## System Requirements

### Hardware
- **CPU**: Apple M1/M2/M3 (ARM64 architecture)
- **RAM**: 16GB minimum
  - 7B model: 8GB required
  - 14B model: 12GB required
  - 32B model: 24GB required (use quantized versions for 16GB)
- **Storage**: 5-30GB depending on model size

### Software
- **OS**: macOS 12.0+ (Monterey or newer)
- **Python**: 3.8+
- **Ollama**: 0.13.0+

---

## Installation

### 1. Ollama Installation (Already Installed ✅)

Your system already has Ollama 0.13.3 installed!

To verify:
```bash
ollama --version
```

If you need to reinstall:
```bash
brew install ollama
# or
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Model Deployment

#### Deploy Qwen2.5-Coder-7B (Recommended for 16GB RAM) ✅
```bash
ollama pull qwen2.5-coder:7b
```
- **Size**: 4.7GB
- **RAM Usage**: ~8GB
- **Speed**: Fast inference (~20-30 tokens/sec on M1)
- **Quality**: Good for most coding tasks

#### Optional: Deploy Qwen2.5-Coder-14B (Better Quality)
```bash
ollama pull qwen2.5-coder:14b
```
- **Size**: 9GB
- **RAM Usage**: ~12GB
- **Speed**: Medium (~10-15 tokens/sec)
- **Quality**: Superior reasoning and code generation

#### Optional: Deploy Qwen2.5-Coder-32B (Best Quality)
```bash
# Use quantized version for 16GB RAM
ollama pull qwen2.5-coder:32b-q4
```
- **Size**: 18GB
- **RAM Usage**: ~20GB (may use swap)
- **Speed**: Slower (~5-10 tokens/sec)
- **Quality**: Best available
- **Note**: May be slow on 16GB RAM

### 3. CLI Tool Setup

The qwen-code CLI tool is already created in your project directory!

```bash
# Make executable (if not already)
chmod +x ./qwen-code

# Test it
./qwen-code --test

# Optional: Add to PATH for global access
sudo ln -s $(pwd)/qwen-code /usr/local/bin/qwen-code
```

---

## Usage Guide

### Basic Commands

#### 1. Simple Code Generation
```bash
./qwen-code "Write a Python function to calculate fibonacci numbers"
```

#### 2. With File Context
```bash
./qwen-code --file index.html "Add meta tags for SEO"
```

#### 3. Multiple Files
```bash
./qwen-code --file api/chat.js --file index.html "Integrate the API with the frontend"
```

#### 4. Disable Project Context (Faster)
```bash
./qwen-code --no-context "Explain async/await in JavaScript"
```

#### 5. Use Different Model
```bash
./qwen-code --model qwen2.5-coder:14b "Optimize this algorithm"
```

#### 6. List Available Models
```bash
./qwen-code --list-models
```

### Real-World Examples

#### Example 1: Add Error Handling
```bash
./qwen-code --file api/chat.js "Add comprehensive error handling to the chat endpoint"
```

#### Example 2: Refactoring
```bash
./qwen-code --file index.html "Refactor this file to use modern ES6+ features"
```

#### Example 3: Debugging
```bash
./qwen-code "I'm getting a TypeError when calling the API. Help me debug this."
```

#### Example 4: Code Review
```bash
./qwen-code --file api/chat.js "Review this code for security vulnerabilities and performance issues"
```

#### Example 5: Generate Tests
```bash
./qwen-code --file api/chat.js "Write comprehensive unit tests for this API endpoint"
```

---

## Model Comparison

### Model Size vs Performance Trade-offs

| Model | Size | RAM | Speed (M1) | Quality | Best For |
|-------|------|-----|------------|---------|----------|
| 7B | 4.7GB | 8GB | ⚡⚡⚡ Fast | ⭐⭐⭐ Good | Quick iterations, testing |
| 14B | 9GB | 12GB | ⚡⚡ Medium | ⭐⭐⭐⭐ Great | Production use, complex tasks |
| 32B-q4 | 18GB | 20GB | ⚡ Slower | ⭐⭐⭐⭐⭐ Best | Critical code, architecture |

### Qwen2.5-Coder vs Claude Code

| Feature | Qwen2.5-Coder | Claude Code |
|---------|---------------|-------------|
| **Cost** | Free | Paid ($20/mo) |
| **Privacy** | 100% Local | Cloud-based |
| **Speed** | Fast (local) | Very Fast |
| **Context Window** | 32K tokens | 200K tokens |
| **Code Quality** | Excellent | Excellent |
| **Multi-language** | ✅ Yes | ✅ Yes |
| **Offline** | ✅ Yes | ❌ No |
| **Project Context** | ✅ Yes | ✅ Yes |
| **Real-time Learning** | ❌ No | ✅ Yes |

### When to Use Each

**Use Qwen2.5-Coder when:**
- Testing/prototyping local AI assistant
- Privacy is critical
- Working offline
- Want to avoid API costs
- Learning about local LLMs

**Use Claude Code when:**
- Need maximum context (200K tokens)
- Want best-in-class quality
- Need real-time capabilities
- Professional development work

---

## Performance Optimization

### M1-Specific Optimizations

#### 1. Memory Management

**Monitor Memory Usage:**
```bash
# Real-time memory monitoring
while true; do
    echo "$(date): $(ps aux | grep ollama | awk '{print $6/1024 " MB"}')";
    sleep 5;
done
```

**Close Other Apps:**
- Close Chrome/Firefox (memory hogs)
- Quit Slack, Docker, etc.
- Use Activity Monitor to identify memory leaks

#### 2. Model Selection Strategy

**Start Session:**
```bash
# Begin with 7B for quick iterations
./qwen-code --model qwen2.5-coder:7b "Quick question..."
```

**Complex Tasks:**
```bash
# Switch to 14B for important code
./qwen-code --model qwen2.5-coder:14b "Design API architecture..."
```

#### 3. Context Optimization

**Disable Context for Simple Queries:**
```bash
./qwen-code --no-context "What is a closure?"
```

**Include Only Relevant Files:**
```bash
# Bad: Includes entire project context
./qwen-code "Fix this bug"

# Good: Only includes relevant file
./qwen-code --no-context --file buggy.js "Fix this bug"
```

#### 4. Ollama Configuration

**Edit `~/.ollama/config.json` (create if needed):**
```json
{
  "num_parallel": 1,
  "num_gpu": 1,
  "num_thread": 4,
  "max_loaded_models": 1
}
```

**Set Environment Variables:**
```bash
# Add to ~/.zshrc or ~/.bash_profile
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_FLASH_ATTENTION=1
```

#### 5. Batch Operations

**Bad:**
```bash
./qwen-code "Fix error 1"
./qwen-code "Fix error 2"  # Model reloads!
./qwen-code "Fix error 3"
```

**Good:**
```bash
./qwen-code "Fix these three errors: 1) ... 2) ... 3) ..."
```

#### 6. Model Preloading

**Keep Model in Memory:**
```bash
# In a separate terminal
ollama run qwen2.5-coder:7b

# Now qwen-code will respond faster
```

---

## Troubleshooting

### Common Issues

#### Issue 1: "Ollama not found"
**Solution:**
```bash
# Check if Ollama is installed
which ollama

# If not found, install
brew install ollama

# Verify
ollama --version
```

#### Issue 2: Slow Response Times

**Symptoms**: Takes 30+ seconds to respond

**Solutions:**
1. **Switch to smaller model**
   ```bash
   ./qwen-code --model qwen2.5-coder:7b "..."
   ```

2. **Close memory-intensive apps**
   ```bash
   # Check memory
   top -o mem

   # Kill Docker if running
   killall Docker
   ```

3. **Reduce context**
   ```bash
   ./qwen-code --no-context "..."
   ```

4. **Check Ollama service**
   ```bash
   # Restart Ollama
   pkill ollama
   ollama serve
   ```

#### Issue 3: "Out of Memory" Errors

**Symptoms**: Model crashes or system becomes unresponsive

**Solutions:**
1. **Use smaller model**
   ```bash
   ollama pull qwen2.5-coder:7b
   ```

2. **Enable swap if needed**
   ```bash
   # macOS handles this automatically
   # Monitor with Activity Monitor
   ```

3. **Close all other apps**

4. **Use quantized models**
   ```bash
   ollama pull qwen2.5-coder:14b-q4
   ```

#### Issue 4: Model Not Responding

**Symptoms**: Hangs indefinitely

**Solutions:**
1. **Check Ollama service**
   ```bash
   ps aux | grep ollama

   # Restart if needed
   pkill ollama
   ollama serve
   ```

2. **Test model directly**
   ```bash
   ollama run qwen2.5-coder:7b
   ```

3. **Reinstall model**
   ```bash
   ollama rm qwen2.5-coder:7b
   ollama pull qwen2.5-coder:7b
   ```

#### Issue 5: Poor Code Quality

**Symptoms**: Responses are incorrect or low-quality

**Solutions:**
1. **Upgrade to larger model**
   ```bash
   ./qwen-code --model qwen2.5-coder:14b "..."
   ```

2. **Provide better context**
   ```bash
   ./qwen-code --file relevant_file.js "detailed question"
   ```

3. **Be more specific in prompts**
   ```bash
   # Bad: "Fix the code"
   # Good: "Fix the TypeError on line 42 where we're trying to access undefined property"
   ```

4. **Use iterative refinement**
   ```bash
   ./qwen-code "Initial implementation"
   # Review output
   ./qwen-code "Improve error handling in previous response"
   ```

---

## Testing Framework

### Running Tests

#### 1. Run All Tests
```bash
./qwen-test-suite.py --model qwen2.5-coder:7b
```

#### 2. Run Specific Test
```bash
./qwen-test-suite.py --test test_1_simple_function
```

#### 3. Generate Comparison Report
```bash
# After running tests
./qwen-test-suite.py --compare
```

### Test Categories

The test suite includes 8 categories:
1. **Code Generation** - Basic function writing
2. **Error Handling** - Adding try-catch blocks
3. **Code Optimization** - Performance improvements
4. **Debugging** - Finding and fixing bugs
5. **Architecture** - System design
6. **Refactoring** - Code reorganization
7. **Async Programming** - Async/await patterns
8. **Testing** - Writing unit tests

### Comparing with Claude Code

**Manual Comparison Process:**

1. **Run Qwen tests**
   ```bash
   ./qwen-test-suite.py --model qwen2.5-coder:7b
   ```

2. **Run same prompts with Claude Code**
   - Copy test instructions from `qwen-test-results/`
   - Run in Claude Code
   - Record response times and quality

3. **Generate comparison**
   ```bash
   ./qwen-test-suite.py --compare
   ```

4. **Review results**
   ```bash
   cat qwen-test-results/comparison_report_*.md
   ```

---

## Advanced Usage

### Creating Custom Prompts

**Template for Code Generation:**
```bash
./qwen-code "
CONTEXT: Working on a REST API for user management
TASK: Create a new endpoint for password reset
REQUIREMENTS:
- Email validation
- Token generation
- Rate limiting
- Error handling
Please provide complete implementation with comments.
"
```

### Integration with Other Tools

**Git Pre-commit Hook:**
```bash
#!/bin/bash
# .git/hooks/pre-commit
./qwen-code --file $(git diff --cached --name-only) "Review this code for issues"
```

**VS Code Integration:**
```json
{
  "tasks": [
    {
      "label": "Qwen Code Review",
      "type": "shell",
      "command": "./qwen-code --file ${file} 'Review this code'"
    }
  ]
}
```

---

## Next Steps

### If Testing Goes Well

1. **Scale Up Model**
   ```bash
   ollama pull qwen2.5-coder:14b
   ```

2. **Deploy on Production Server**
   - Use dedicated GPU server
   - Deploy 32B or 70B model
   - Set up API endpoint

3. **Create Web Interface**
   - Build REST API around qwen-code
   - Add authentication
   - Create web UI

### Resources

- **Ollama Docs**: https://github.com/ollama/ollama
- **Qwen2.5-Coder**: https://huggingface.co/Qwen/Qwen2.5-Coder
- **Model Card**: https://ollama.com/library/qwen2.5-coder

---

## Summary

You now have:
✅ Ollama installed and optimized for M1
✅ Qwen2.5-Coder-7B deployed
✅ CLI tool (`qwen-code`) ready to use
✅ Testing framework for quality comparison
✅ Performance optimization guide
✅ Troubleshooting documentation

**Quick Start:**
```bash
# Test the setup
./qwen-code --test

# Try a real task
./qwen-code "Write a function to validate email addresses"

# Run comprehensive tests
./qwen-test-suite.py
```

**Happy Coding! 🚀**

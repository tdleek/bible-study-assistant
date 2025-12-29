#!/bin/bash
# Qwen-Code Quick Start Script
# Helps you get started with the local AI coding assistant

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Qwen-Code Quick Start Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print status
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        exit 1
    fi
}

# Check system
echo -e "${YELLOW}[1/6]${NC} Checking system requirements..."
if [[ $(uname -m) == "arm64" ]]; then
    print_status "Apple Silicon detected"
else
    echo -e "${RED}Warning: Not running on Apple Silicon${NC}"
fi

# Check Ollama
echo -e "\n${YELLOW}[2/6]${NC} Checking Ollama installation..."
if command -v ollama &> /dev/null; then
    OLLAMA_VERSION=$(ollama --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
    print_status "Ollama installed (version $OLLAMA_VERSION)"
else
    echo -e "${RED}✗ Ollama not found${NC}"
    echo -e "Install with: ${BLUE}brew install ollama${NC}"
    exit 1
fi

# Check for models
echo -e "\n${YELLOW}[3/6]${NC} Checking installed models..."
if ollama list | grep -q "qwen2.5-coder:7b"; then
    print_status "Qwen2.5-Coder-7B found"
    HAS_7B=true
else
    echo -e "${YELLOW}→${NC} Qwen2.5-Coder-7B not found"
    HAS_7B=false
fi

if ollama list | grep -q "qwen2.5-coder:14b"; then
    print_status "Qwen2.5-Coder-14B found"
    HAS_14B=true
else
    HAS_14B=false
fi

# Prompt to install if missing
if [ "$HAS_7B" = false ]; then
    echo -e "\n${YELLOW}Would you like to install Qwen2.5-Coder-7B? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${BLUE}Downloading model (4.7GB)...${NC}"
        ollama pull qwen2.5-coder:7b
        print_status "Model installed"
    fi
fi

# Check CLI tool
echo -e "\n${YELLOW}[4/6]${NC} Checking qwen-code CLI..."
if [ -f "./qwen-code" ]; then
    if [ -x "./qwen-code" ]; then
        print_status "qwen-code is executable"
    else
        echo -e "${YELLOW}→${NC} Making qwen-code executable..."
        chmod +x ./qwen-code
        print_status "qwen-code is now executable"
    fi
else
    echo -e "${RED}✗ qwen-code not found${NC}"
    exit 1
fi

# Test the tool
echo -e "\n${YELLOW}[5/6]${NC} Testing qwen-code..."
echo -e "${BLUE}Running test command...${NC}\n"
./qwen-code --test

# Show usage examples
echo -e "\n${YELLOW}[6/6]${NC} Setup complete! 🎉\n"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Quick Usage Examples:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}1. Simple code generation:${NC}"
echo -e "   ./qwen-code \"Write a function to sort an array\"\n"

echo -e "${BLUE}2. With file context:${NC}"
echo -e "   ./qwen-code --file api/chat.js \"Add error handling\"\n"

echo -e "${BLUE}3. Code review:${NC}"
echo -e "   ./qwen-code --file index.html \"Review this code for issues\"\n"

echo -e "${BLUE}4. Debugging help:${NC}"
echo -e "   ./qwen-code \"Explain why I'm getting a TypeError\"\n"

echo -e "${BLUE}5. Run test suite:${NC}"
echo -e "   ./qwen-test-suite.py\n"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Offer to install to PATH
echo -e "${YELLOW}Would you like to install qwen-code globally? (y/n)${NC}"
echo -e "(This allows you to run 'qwen-code' from anywhere)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    sudo ln -sf "$(pwd)/qwen-code" /usr/local/bin/qwen-code
    print_status "qwen-code installed to /usr/local/bin"
    echo -e "\n${GREEN}You can now run 'qwen-code' from any directory!${NC}"
fi

echo -e "\n${BLUE}For complete documentation, see:${NC} QWEN-CODE-GUIDE.md"
echo -e "${BLUE}Happy coding! 🚀${NC}\n"

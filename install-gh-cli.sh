#!/bin/bash

# GitHub CLI Installation Script for Ubuntu/Debian

echo "📦 Installing GitHub CLI..."

# Method 1: Using apt (if available)
if command -v apt &> /dev/null; then
    echo "🔧 Installing via apt package manager..."
    sudo apt update
    sudo apt install gh -y
fi

# Method 2: Manual download if apt fails
if ! command -v gh &> /dev/null; then
    echo "🔧 Downloading GitHub CLI manually..."
    wget https://github.com/cli/cli/releases/latest/download/gh_*_linux_amd64.tar.gz
    tar xzf gh_*_linux_amd64.tar.gz
    sudo mv gh_*_linux_amd64/bin/gh /usr/local/bin/
    rm -rf gh_*_linux_amd64*
fi

# Check installation
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI installed successfully!"
    echo "🔐 Now run: gh auth login"
    echo "📤 Then run: gh repo create wifi-voucher-system --public --source=. --remote=origin --push"
else
    echo "❌ GitHub CLI installation failed. Please use Option 1 (Manual upload)."
fi
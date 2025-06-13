#!/bin/bash

# Repository Migration Script
# This script will help you move the project to the new GitHub repository

echo "🚀 Hehe Miner Repository Migration Script"
echo "=========================================="
echo ""

# Step 1: Configure Git User
echo "📝 Step 1: Configuring Git user..."
git config user.name "tfarooqui664"
git config user.email "tfarooqui664@gmail.com"
echo "✅ Git user configured"
echo ""

# Step 2: Remove existing git history
echo "🗑️  Step 2: Removing existing git history..."
rm -rf .git
echo "✅ Git history removed"
echo ""

# Step 3: Initialize new git repository
echo "🆕 Step 3: Initializing new git repository..."
git init
echo "✅ New git repository initialized"
echo ""

# Step 4: Add new remote origin
echo "🔗 Step 4: Adding new remote origin..."
git remote add origin https://github.com/tahafarooqui664/hehe-miner.git
echo "✅ New remote origin added"
echo ""

# Step 5: Add all files
echo "📁 Step 5: Adding all files..."
git add .
echo "✅ All files added"
echo ""

# Step 6: Create initial commit
echo "💾 Step 6: Creating initial commit..."
git commit -m "Initial commit: Hehe Miner - Telegram Mining Game

🎮 Complete Telegram-based mining game with:
- ✅ Free basic plan activation (no payment required)
- ⛏️ Mine 4 HEHE tokens every 4 hours
- 🎯 Task system with social media tasks
- 👥 Referral system (0.5 HEHE per referral)
- 🚀 Speed upgrades with TON wallet integration
- 🎨 Beautiful UI with #33ffff color scheme
- 🤖 Telegram bot with custom splash screen
- 📱 Mobile-first responsive design
- 🔐 JWT authentication system
- 💾 SQLite database with Prisma ORM

Ready for production deployment!"
echo "✅ Initial commit created"
echo ""

# Step 7: Push to new repository
echo "🚀 Step 7: Pushing to new repository..."
git branch -M main
git push -u origin main
echo "✅ Code pushed to new repository"
echo ""

echo "🎉 Migration Complete!"
echo "====================="
echo ""
echo "📋 Summary:"
echo "• Old repository: umerfarooqlaghari/hehe-miner"
echo "• New repository: https://github.com/tahafarooqui664/hehe-miner"
echo "• Git user: tfarooqui664 <tfarooqui664@gmail.com>"
echo "• History: Fresh start (no old history)"
echo ""
echo "🔗 Next Steps:"
echo "1. Visit: https://github.com/tahafarooqui664/hehe-miner"
echo "2. Update any deployment settings (Vercel, etc.)"
echo "3. Update environment variables if needed"
echo "4. Test the application"
echo ""
echo "✅ Your Hehe Miner project is now successfully migrated!"

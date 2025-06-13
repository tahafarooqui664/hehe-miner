# 🤖 Hehe Miner Bot Setup Guide

This guide will help you set up your Telegram bot with custom assets, proper configuration, and the #3fff color scheme.

## 📋 Quick Setup

### 1. Run the Setup Script
```bash
node setup-bot-complete.js
```

This will automatically configure:
- ✅ Webhook URL
- ✅ Bot commands
- ✅ Proper descriptions
- ✅ Referral system (0.5 HEHE per referral)

### 2. Upload Custom Assets to BotFather

#### Bot Icon Setup
1. Go to [@BotFather](https://t.me/botfather) on Telegram
2. Send `/mybots`
3. Select "HeheMinerBot"
4. Choose "Edit Bot"
5. Select "Edit Botpic"
6. Upload the file: `public/bot-icon.svg`

#### Bot Description
1. In BotFather, select "Edit Description"
2. Use this description:
```
🎮 Mine HEHE tokens every 4 hours! 💰 Complete tasks, refer friends, and upgrade your mining power. Start your crypto mining journey now!
```

#### Bot About
1. Select "Edit About"
2. Use: `HEHE Miner - Crypto Mining Game`

## 🎨 Custom Assets Created

### Splash Screen (`public/splash-screen.svg`)
- **Size**: 512x512 pixels
- **Format**: SVG (scalable)
- **Color Scheme**: #3fff primary theme
- **Features**: 
  - Animated miner character
  - Floating HEHE coins
  - Sparkle effects
  - Gradient background

### Bot Icon (`public/bot-icon.svg`)
- **Size**: 512x512 pixels  
- **Format**: SVG (scalable)
- **Color Scheme**: #3fff primary theme
- **Features**:
  - Professional miner character
  - Pickaxe tool
  - HEHE branding
  - Glow effects

## 🎨 Color Scheme

### Primary Colors
- **Main**: `#3fff` (bright cyan/turquoise)
- **Secondary**: `#2eee` (medium cyan)
- **Accent**: `#1ddd` (dark cyan)

### Usage Guidelines
- Use `#3fff` for primary buttons and headers
- Use `#2eee` for secondary elements
- Use `#1ddd` for accents and borders
- Maintain consistency across all bot interfaces

## 🤖 Bot Commands

| Command | Description | Reward Info |
|---------|-------------|-------------|
| `/start` | Welcome message with launch button | - |
| `/mine` | Start mining HEHE tokens | 4 HEHE per 4 hours |
| `/balance` | Check current balance | - |
| `/tasks` | View available tasks | Various rewards |
| `/referral` | Get referral link | **0.5 HEHE per referral** |
| `/help` | Get help and instructions | - |

## 🎁 Referral System

### Current Configuration
- **Reward**: 0.5 HEHE tokens per successful referral
- **Limit**: Unlimited referrals
- **Benefits**: Both referrer and referred user get rewards

### How It Works
1. User gets unique referral link from app
2. Friend clicks link and joins via Telegram
3. Friend activates their account in the web app
4. Referrer receives 0.5 HEHE tokens automatically

## 📱 Testing Your Bot

### 1. Basic Test
```bash
# Test bot connection
node test-bot.js
```

### 2. Manual Test
1. Open [@HeheMinerBot](https://t.me/HeheMinerBot)
2. Send `/start`
3. Click "🚀 Launch Hehe Miner" button
4. Verify web app opens correctly

### 3. Referral Test
1. Get referral link from app
2. Share with test account
3. Verify referral tracking works
4. Check reward distribution

## 🔧 Configuration Files

### Environment Variables
Make sure these are set in your `.env`:
```env
TELEGRAM_BOT_TOKEN=8012094721:AAE2mRgi-UgUCSjTSj5gpMyrEb3cbOV608o
NEXT_PUBLIC_APP_URL=https://hehe-miner.vercel.app
```

### Webhook Configuration
- **URL**: `https://hehe-miner.vercel.app/api/telegram/webhook`
- **Method**: POST
- **Content-Type**: application/json

## 🚀 Deployment Checklist

- [ ] Run `node setup-bot-complete.js`
- [ ] Upload bot icon to BotFather
- [ ] Set bot description in BotFather
- [ ] Test all commands work
- [ ] Verify referral system
- [ ] Check web app integration
- [ ] Test on mobile devices
- [ ] Verify color scheme consistency

## 🎯 Key Features

### ✅ Free Basic Plan
- Users can activate basic plan without payment
- Immediate access to mining functionality
- No wallet connection required for basic features

### 💰 TON Integration
- Speed upgrades require TON wallet
- Secure blockchain payments
- Real transaction verification

### 👥 Social Features
- Referral system with real rewards
- Task completion tracking
- Leaderboards and achievements

## 📞 Support

If you encounter issues:
1. Check the console logs for errors
2. Verify webhook is receiving messages
3. Test bot commands individually
4. Check database connections
5. Verify environment variables

## 🔗 Important Links

- **Bot**: https://t.me/HeheMinerBot
- **Web App**: https://hehe-miner.vercel.app
- **BotFather**: https://t.me/botfather
- **Repository**: https://github.com/tahafarooqui664/hehe-miner

---

**🎉 Your Hehe Miner bot is now ready with custom assets and the #3fff color scheme!**

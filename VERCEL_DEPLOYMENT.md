# 🚀 Hehe Miner - Vercel Deployment Guide

## Quick Deployment Steps

### 1. Prerequisites ✅
- [x] GitHub repository: `https://github.com/umerfarooqlaghari/hehe-miner`
- [x] Telegram Bot Token: `8012094721:AAE2mRgi-UgUCSjTSj5gpMyrEb3cbOV608o`
- [x] JWT Secret: `076c92f674d1e859d3954fabc2701864d069f509df7ff93f6c540b2ba6401e67`
- [x] Code is production-ready

### 2. Deploy to Vercel

#### Option A: One-Click Deploy (Recommended)
1. **Go to Vercel**: [vercel.com](https://vercel.com)
2. **Sign in** with your GitHub account
3. **Import Project**: Click "New Project" → Import from GitHub
4. **Select Repository**: Choose `umerfarooqlaghari/hehe-miner`
5. **Configure Project**:
   - Project Name: `hehe-miner`
   - Framework Preset: `Next.js`
   - Root Directory: `./` (default)

#### Option B: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### 3. Environment Variables Setup

In your Vercel dashboard, go to **Settings** → **Environment Variables** and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `JWT_SECRET` | `076c92f674d1e859d3954fabc2701864d069f509df7ff93f6c540b2ba6401e67` | Production |
| `TELEGRAM_BOT_TOKEN` | `8012094721:AAE2mRgi-UgUCSjTSj5gpMyrEb3cbOV608o` | Production |
| `NODE_ENV` | `production` | Production |
| `ENABLE_MOCK_AUTH` | `false` | Production |
| `DATABASE_URL` | `prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKWERLSDVXSFBaQUNISllETkc2NUVHM0IiLCJ0ZW5hbnRfaWQiOiIzZDcxYmJhZGFmMDY3Mjk4YTBlNmMwMzkxMzJmMDdlNzZkNGUyNmI4YTg2M2U2NjdlZTU2MDRmNTFiYmVlM2IyIiwiaW50ZXJuYWxfc2VjcmV0IjoiNDU4ODAyYjEtYjFlZS00ZGZmLTkyZGUtMzYxM2FlYTAwYWRiIn0.1XNe84cyNw1_W-_CXNHBP5kZsVTCs9tMEM6VUIBzhhY` | Production |
| `NEXT_PUBLIC_APP_NAME` | `Hehe Miner` | Production |

### 4. Update App URL

After deployment, update the `NEXT_PUBLIC_APP_URL` environment variable:
- Get your Vercel app URL (e.g., `https://hehe-miner-xyz.vercel.app`)
- Add it as `NEXT_PUBLIC_APP_URL` in Vercel environment variables
- Redeploy the app

### 5. Configure Telegram Bot

#### Set Webhook URL
```bash
curl -X POST "https://api.telegram.org/bot8012094721:AAE2mRgi-UgUCSjTSj5gpMyrEb3cbOV608o/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-vercel-app.vercel.app/api/telegram/webhook"}'
```

#### Set Bot Commands
```bash
curl -X POST "https://api.telegram.org/bot8012094721:AAE2mRgi-UgUCSjTSj5gpMyrEb3cbOV608o/setMyCommands" \
     -H "Content-Type: application/json" \
     -d '{
       "commands": [
         {"command": "start", "description": "🚀 Start Hehe Miner"},
         {"command": "balance", "description": "💰 Check your balance"},
         {"command": "mine", "description": "⛏️ Start mining"},
         {"command": "help", "description": "❓ Get help"}
       ]
     }'
```

#### Create Web App Button
Message your bot and use this code to add a web app button:
```javascript
// In your bot code
const webAppUrl = 'https://your-vercel-app.vercel.app'
const keyboard = {
  inline_keyboard: [[
    { text: '🚀 Launch Hehe Miner', web_app: { url: webAppUrl } }
  ]]
}
```

### 6. Test Deployment

1. **Visit your app**: `https://your-vercel-app.vercel.app`
2. **Test landing page**: Should show beautiful loading animation
3. **Test authentication**: Try mock login (should work)
4. **Test mining**: Start a mining session
5. **Test Telegram**: Open app through Telegram bot

### 7. Post-Deployment Checklist

- [ ] App loads correctly
- [ ] Landing page animations work
- [ ] Authentication flow works
- [ ] Mining system functions
- [ ] Database operations work
- [ ] API endpoints respond
- [ ] Telegram integration works
- [ ] Mobile responsive design
- [ ] No console errors

### 8. Monitoring & Maintenance

#### Vercel Analytics
- Enable Vercel Analytics in your dashboard
- Monitor performance and usage

#### Error Tracking
Add Sentry for error tracking:
```bash
npm install @sentry/nextjs
```

#### Database Backup
- SQLite database is included in deployment
- Consider upgrading to PostgreSQL for production scale
- Set up regular backups

### 9. Scaling Considerations

#### Database Upgrade (When needed)
```env
# Switch to PostgreSQL
DATABASE_URL="postgresql://user:pass@host:port/database"
```

#### Performance Optimization
- Enable Vercel Edge Functions
- Add Redis for caching
- Implement CDN for assets

### 10. Troubleshooting

#### Common Issues:

**Build Fails:**
- Check environment variables are set
- Ensure all dependencies are installed
- Check Prisma schema is valid

**Database Issues:**
- Verify DATABASE_URL is correct
- Check Prisma migrations
- Ensure seed data is loaded

**Telegram Issues:**
- Verify bot token is correct
- Check webhook URL is set
- Ensure HTTPS is enabled

#### Debug Commands:
```bash
# Check Vercel logs
vercel logs

# Test API endpoints
curl https://your-app.vercel.app/api/auth/telegram

# Check environment variables
vercel env ls
```

### 11. Success! 🎉

Your Hehe Miner app is now live and ready for users!

**Next Steps:**
1. Share your app with friends
2. Monitor user engagement
3. Add new features based on feedback
4. Scale as needed

**App Features:**
- ✅ Beautiful landing page with animations
- ✅ Complete mining system (4-hour cycles)
- ✅ Telegram Web App integration
- ✅ User authentication and profiles
- ✅ Task and referral systems
- ✅ Subscription upgrades
- ✅ Mobile-optimized design
- ✅ Real-time progress tracking

---

**Need Help?**
- Check Vercel documentation
- Review the PRODUCTION_GUIDE.md
- Test in development first
- Monitor Vercel logs for errors

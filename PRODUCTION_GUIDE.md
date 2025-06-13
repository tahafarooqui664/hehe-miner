# Hehe Miner - Production Deployment Guide

## Prerequisites for Production

### 1. Required API Keys and Secrets

#### Telegram Bot Setup (REQUIRED)
1. **Create a Telegram Bot:**
   - Message @BotFather on Telegram
   - Use `/newbot` command
   - Follow instructions to get your `TELEGRAM_BOT_TOKEN`

2. **Set up Telegram Web App:**
   - Use `/newapp` command with @BotFather
   - Configure your web app URL
   - Get the bot secret for webhook validation

#### JWT Secret (REQUIRED)
- Generate a strong, random secret key (minimum 32 characters)
- Use: `openssl rand -base64 32` or online generator
- Never use the default development secret in production

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required Production Variables:**
```env
# Database (use PostgreSQL for production)
DATABASE_URL="postgresql://username:password@host:port/database"

# Security
JWT_SECRET="your-super-secret-jwt-key-32-chars-minimum"
NODE_ENV="production"
ENABLE_MOCK_AUTH="false"

# Telegram
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_BOT_SECRET="your-telegram-webhook-secret"

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### 3. Database Migration (PostgreSQL Recommended)

1. **Install PostgreSQL** (local or cloud service like Supabase, Railway, etc.)

2. **Update Prisma Schema:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. **Run Migrations:**
```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Deployment Options

#### Option A: Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

#### Option B: Railway
1. Connect repository to Railway
2. Add environment variables
3. Deploy with automatic builds

#### Option C: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 5. Security Checklist

- [ ] JWT secret is strong and unique
- [ ] Database credentials are secure
- [ ] HTTPS is enabled
- [ ] Rate limiting is configured
- [ ] Input validation is in place
- [ ] CORS is properly configured
- [ ] Environment variables are not exposed

### 6. Performance Optimizations

#### Database Optimization
- Add database indexes for frequently queried fields
- Use connection pooling
- Consider read replicas for high traffic

#### Caching
- Implement Redis for session storage
- Cache user profiles and mining sessions
- Use CDN for static assets

#### Monitoring
- Set up error tracking (Sentry)
- Monitor performance metrics
- Set up uptime monitoring

### 7. Telegram Web App Integration

#### Bot Commands Setup
```javascript
// Set webhook for your bot
const webhookUrl = 'https://your-domain.com/api/telegram/webhook'
await bot.setWebhook(webhookUrl)

// Set bot commands
await bot.setMyCommands([
  { command: 'start', description: 'Start mining' },
  { command: 'balance', description: 'Check balance' },
  { command: 'help', description: 'Get help' }
])
```

#### Web App Button
Add to your Telegram bot:
```javascript
const webAppUrl = 'https://your-domain.com'
const keyboard = {
  inline_keyboard: [[
    { text: '🚀 Launch Hehe Miner', web_app: { url: webAppUrl } }
  ]]
}
```

### 8. Testing Production Setup

1. **Test Telegram Integration:**
   - Verify bot responds to commands
   - Test web app launch from Telegram
   - Confirm user authentication works

2. **Test Mining Flow:**
   - Start mining session
   - Verify timer countdown
   - Test token claiming

3. **Test Database:**
   - Verify data persistence
   - Test user creation and updates
   - Check mining session tracking

### 9. Backup and Recovery

- Set up automated database backups
- Store backups in secure, separate location
- Test recovery procedures regularly
- Document recovery steps

### 10. Scaling Considerations

#### For High Traffic:
- Use load balancers
- Implement horizontal scaling
- Consider microservices architecture
- Use message queues for background tasks

#### Database Scaling:
- Read replicas for queries
- Database sharding if needed
- Connection pooling
- Query optimization

## Launch Checklist

- [ ] All environment variables configured
- [ ] Database migrated and seeded
- [ ] Telegram bot configured and tested
- [ ] HTTPS certificate installed
- [ ] Domain configured
- [ ] Error monitoring set up
- [ ] Backup system configured
- [ ] Performance monitoring enabled
- [ ] Security audit completed
- [ ] Load testing performed

## Post-Launch Monitoring

1. **Monitor Key Metrics:**
   - User registration rate
   - Mining session completion rate
   - API response times
   - Error rates

2. **User Feedback:**
   - Monitor Telegram support channel
   - Track user complaints/issues
   - Implement feedback collection

3. **Performance:**
   - Database query performance
   - API endpoint response times
   - Memory and CPU usage

## Support and Maintenance

- Regular security updates
- Database maintenance
- Performance optimization
- Feature updates based on user feedback
- Bug fixes and improvements

---

**Need Help?** 
- Check the troubleshooting section in README.md
- Review logs for error details
- Test in development environment first

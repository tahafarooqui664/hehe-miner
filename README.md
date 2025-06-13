# Hehe Miner - Telegram Airdrop Mining Game

A complete end-to-end Telegram-based mining game built with Next.js, TypeScript, Prisma, and SQLite. Users can mine HEHE tokens, complete tasks, refer friends, and upgrade their mining capabilities.

**Repository**: https://github.com/tahafarooqui664/hehe-miner

## 🚀 Features

### ✅ Implemented Features

1. **Authentication System**
   - Telegram Web App authentication (production-ready)
   - Mock authentication for local development
   - JWT-based session management

2. **Mining System**
   - Basic plan requirement ($1) to start mining
   - Mine 4 HEHE tokens every 4 hours
   - Real-time mining progress tracking
   - Automatic token claiming after 4-hour cycles

3. **Task System**
   - Pre-seeded social media tasks
   - Reward system (0.3-0.7 HEHE per task)
   - Automatic reward distribution
   - Task completion tracking

4. **Referral System**
   - Unique referral links for each user
   - 0.5 HEHE reward per successful referral
   - Referral history and statistics

5. **Subscription System**
   - Basic mining plan ($1 one-time purchase)
   - Speed upgrades ($1 each, +0.25 HEHE per upgrade)
   - Unlimited speed upgrades

6. **Airdrop Page**
   - Total balance display
   - "Coming Soon" status
   - Token breakdown information

7. **Complete UI/UX**
   - Mobile-first responsive design
   - Dark theme with gradient accents
   - Bottom navigation
   - Real-time updates

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT, Telegram Web App SDK
- **Deployment**: Ready for Vercel/Netlify

## 📁 Project Structure

```
hehe-miner/
├── src/
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   ├── auth/
│   │   │   ├── mining/
│   │   │   ├── subscription/
│   │   │   ├── tasks/
│   │   │   ├── referrals/
│   │   │   └── user/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/              # React components
│   │   ├── AuthScreen.tsx
│   │   ├── MainApp.tsx
│   │   ├── MiningScreen.tsx
│   │   ├── TasksScreen.tsx
│   │   ├── ReferralsScreen.tsx
│   │   ├── AirdropScreen.tsx
│   │   └── SubscriptionScreen.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   └── lib/
│       ├── api.ts               # API client
│       ├── auth.ts              # Auth utilities
│       ├── prisma.ts            # Database client
│       └── telegram.ts          # Telegram utilities
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Seed data
└── .env                         # Environment variables
```

## 🗄 Database Schema

The application uses a comprehensive database schema with the following models:

- **Users**: User profiles, balances, mining power
- **MiningSession**: Active and completed mining sessions
- **Tasks**: Available tasks with rewards
- **UserTasks**: User task completion tracking
- **Referrals**: Referral relationships and rewards
- **Subscriptions**: Purchase history and upgrades

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Local Development Authentication

For local development, the app includes a mock authentication system:

1. Click "Mock Login (Development)" on the login screen
2. This creates a test user with the basic plan already purchased
3. You can immediately start testing all features

## 🎮 How to Use

### For Local Testing:

1. **Login**: Use the "Mock Login" button
2. **Start Mining**: Go to Mine tab, click "Start Mining"
3. **Complete Tasks**: Visit Tasks tab, click "Do Task" on any task
4. **Get Referrals**: Visit Referrals tab, copy your referral link
5. **Upgrade Speed**: Visit Upgrade tab, purchase speed upgrades
6. **Check Airdrop**: View your total balance in the Airdrop tab

### Mining Logic:

- Purchase basic plan ($1) to unlock mining
- Mine 4 HEHE tokens every 4 hours
- Speed upgrades add +0.25 HEHE per upgrade
- Mining sessions run for exactly 4 hours
- Claim tokens when mining completes

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Telegram Bot (for production)
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Local Development
ENABLE_MOCK_AUTH="true"
```

## 🚀 Production Deployment

### For Telegram Integration:

1. Create a Telegram Bot via @BotFather
2. Set up Telegram Web App
3. Configure webhook URL
4. Update environment variables
5. Deploy to Vercel/Netlify

### For Payment Integration:

The subscription system is currently simulated. For production:

1. Integrate with Stripe, PayPal, or crypto payments
2. Add webhook handlers for payment confirmation
3. Implement proper payment validation
4. Add payment history tracking

## 🧪 API Testing

Test the API endpoints using curl:

```bash
# Login (mock)
curl -X POST http://localhost:3000/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"mock": true}'

# Get user profile
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Start mining
curl -X POST http://localhost:3000/api/mining/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get tasks
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📱 Mobile Experience

The application is designed mobile-first and works perfectly on:
- iOS Safari
- Android Chrome
- Telegram Web App
- Desktop browsers

## 🔒 Security Features

- JWT authentication with expiration
- Telegram data validation
- SQL injection protection via Prisma
- Input validation and sanitization
- CORS protection

## 🎯 Future Enhancements

- Real payment processor integration
- Push notifications for mining completion
- Leaderboards and competitions
- NFT rewards system
- Multi-language support
- Advanced analytics dashboard

## 📄 License

This project is for demonstration purposes. Modify as needed for your use case.

---

**Ready to mine some HEHE tokens? Start the app and begin your mining journey! ⛏️💎**

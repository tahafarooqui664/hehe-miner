#!/bin/bash

# Hehe Miner Deployment Script for Vercel

echo "🚀 Preparing Hehe Miner for Vercel deployment..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema to PostgreSQL
echo "🗄️ Pushing database schema..."
npx prisma db push

# Seed the database with initial data
echo "🌱 Seeding database..."
npx prisma db seed

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your GitHub repo to Vercel"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""
echo "🔑 Environment variables to set in Vercel:"
echo "- JWT_SECRET: 076c92f674d1e859d3954fabc2701864d069f509df7ff93f6c540b2ba6401e67"
echo "- TELEGRAM_BOT_TOKEN: 8012094721:AAE2mRgi-UgUCSjTSj5gpMyrEb3cbOV608o"
echo "- NODE_ENV: production"
echo "- ENABLE_MOCK_AUTH: false"
echo "- DATABASE_URL: prisma+postgres://accelerate.prisma-data.net/?api_key=..."

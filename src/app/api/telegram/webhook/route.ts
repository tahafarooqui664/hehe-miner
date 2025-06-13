import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const WEB_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hehe-miner.vercel.app'

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      is_bot: boolean
      first_name: string
      last_name?: string
      username?: string
    }
    chat: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      type: string
    }
    date: number
    text?: string
  }
}

async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...(replyMarkup && { reply_markup: replyMarkup })
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error sending message:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()
    
    if (!update.message) {
      return NextResponse.json({ ok: true })
    }

    const { message } = update
    const chatId = message.chat.id
    const text = message.text || ''
    const firstName = message.from.first_name

    console.log(`Received message from ${firstName}: ${text}`)

    // Handle different commands
    if (text.startsWith('/start')) {
      // Extract referral parameter if present
      const parts = text.split(' ')
      const referralId = parts.length > 1 ? parts[1] : null

      let webAppUrl = WEB_APP_URL
      if (referralId) {
        // Store the referral temporarily in database for this user
        try {
          await prisma.pendingReferral.upsert({
            where: { telegramId: message.from.id.toString() },
            update: { referrerId: referralId },
            create: {
              telegramId: message.from.id.toString(),
              referrerId: referralId
            }
          })
          console.log(`🚨 User ${firstName} started with referral: ${referralId}`)
          console.log(`🚨 Stored pending referral for user ${message.from.id}`)
        } catch (error) {
          console.error('🚨 Failed to store pending referral:', error)
        }
      }

      await sendMessage(
        chatId,
        `🎮 <b>Welcome to Hehe Miner, ${firstName}!</b>

⛏️ Start mining HEHE tokens and earn rewards!

<b>🚀 Features:</b>
💰 Mine tokens every 4 hours
📈 Upgrade your mining power
👥 Refer friends for bonus rewards
🎯 Complete tasks for extra tokens
🏆 Compete on leaderboards

<b>Ready to start your mining journey?</b>
Click the button below to launch the app!${referralId ? '\n\n🎁 <b>Bonus:</b> You were referred by a friend! You\'ll get extra rewards!' : ''}`,
        {
          inline_keyboard: [[
            {
              text: "🚀 Launch Hehe Miner",
              web_app: { url: webAppUrl }
            }
          ]]
        }
      )
    } else {
      switch (text) {

      case '/mine':
        await sendMessage(
          chatId,
          `⛏️ <b>Ready to mine HEHE tokens?</b>

Launch the app to start your mining session!
Each session lasts 4 hours and earns you tokens based on your mining power.

<b>💡 Tip:</b> Upgrade your mining power to earn more tokens per session!`,
          {
            inline_keyboard: [[
              {
                text: "⛏️ Start Mining",
                web_app: { url: WEB_APP_URL }
              }
            ]]
          }
        )
        break

      case '/balance':
        await sendMessage(
          chatId,
          `💰 <b>Check Your Balance</b>

Launch the app to view:
• Your current HEHE token balance
• Mining session progress
• Completed tasks
• Referral rewards

<b>Track your earnings in real-time!</b>`,
          {
            inline_keyboard: [[
              {
                text: "💰 View Balance",
                web_app: { url: WEB_APP_URL }
              }
            ]]
          }
        )
        break

      case '/tasks':
        await sendMessage(
          chatId,
          `📋 <b>Available Tasks</b>

Complete tasks to earn bonus HEHE tokens:
• Daily check-in rewards
• Social media tasks
• Referral challenges
• Special events

<b>More tasks = More tokens!</b>`,
          {
            inline_keyboard: [[
              {
                text: "📋 View Tasks",
                web_app: { url: WEB_APP_URL }
              }
            ]]
          }
        )
        break

      case '/referral':
        await sendMessage(
          chatId,
          `👥 <b>Referral Program</b>

Invite friends and earn bonus tokens!

<b>🎁 Rewards:</b>
• <b>0.5 HEHE tokens</b> for each successful referral
• Your friends get bonus rewards too
• No limit on referrals - invite unlimited friends!

<b>How it works:</b>
1. Get your unique referral link from the app
2. Share it with friends
3. When they join and activate their account, you both get rewards!

Launch the app to get your unique referral link!`,
          {
            inline_keyboard: [[
              {
                text: "👥 Get Referral Link",
                web_app: { url: WEB_APP_URL }
              }
            ]]
          }
        )
        break

      case '/help':
        await sendMessage(
          chatId,
          `❓ <b>Hehe Miner Help</b>

<b>🎮 How to Play:</b>
1. Launch the app using the button below
2. Start your first mining session (4 hours)
3. Complete tasks for bonus tokens
4. Refer friends to earn more
5. Upgrade your mining power

<b>📱 Commands:</b>
/start - Welcome message
/mine - Start mining
/balance - Check balance
/tasks - View tasks
/referral - Get referral link
/help - This help message

<b>Need more help?</b> Launch the app for detailed guides!`,
          {
            inline_keyboard: [[
              {
                text: "🚀 Launch App",
                web_app: { url: WEB_APP_URL }
              }
            ]]
          }
        )
        break

      default:
        // Handle any other message
        await sendMessage(
          chatId,
          `🤖 <b>Hi ${firstName}!</b>

I'm the Hehe Miner bot! Use these commands:

/start - Get started
/mine - Start mining
/balance - Check balance
/tasks - View tasks
/referral - Referral program
/help - Get help

Or just click the button below to launch the app!`,
          {
            inline_keyboard: [[
              {
                text: "🚀 Launch Hehe Miner",
                web_app: { url: WEB_APP_URL }
              }
            ]]
          }
        )
        break
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Hehe Miner Telegram Bot Webhook is running!',
    timestamp: new Date().toISOString()
  })
}

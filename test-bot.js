// Test Bot Script - Run this to test your bot manually
const BOT_TOKEN = '8012094721:AAE2mRgi-UgUCSjTSj5gpMyrEb3cbOV608o';
const WEB_APP_URL = 'https://hehe-miner.vercel.app';

let lastUpdateId = 0;

async function sendMessage(chatId, text, replyMarkup = null) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...(replyMarkup && { reply_markup: replyMarkup })
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('Message sent:', result.ok ? '✅' : '❌', result.description || '');
    return result;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

async function getUpdates() {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        
        if (update.message) {
          const message = update.message;
          const chatId = message.chat.id;
          const text = message.text || '';
          const firstName = message.from.first_name;
          
          console.log(`📱 Message from ${firstName} (${chatId}): ${text}`);
          
          // Respond to /start
          if (text === '/start') {
            await sendMessage(
              chatId,
              `🎮 <b>Welcome to Hehe Miner, ${firstName}!</b>

⛏️ Start mining HEHE tokens and earn rewards!

<b>🚀 Features:</b>
💰 Mine tokens every 4 hours
📈 Upgrade your mining power
👥 Refer friends for bonus rewards
🎯 Complete tasks for extra tokens

<b>Ready to start your mining journey?</b>
Click the button below to launch the app!`,
              {
                inline_keyboard: [[
                  {
                    text: "🚀 Launch Hehe Miner",
                    web_app: { url: WEB_APP_URL }
                  }
                ]]
              }
            );
          } else {
            // Respond to any other message
            await sendMessage(
              chatId,
              `🤖 Hi ${firstName}! Send /start to begin mining HEHE tokens!`,
              {
                inline_keyboard: [[
                  {
                    text: "🚀 Launch Hehe Miner",
                    web_app: { url: WEB_APP_URL }
                  }
                ]]
              }
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error getting updates:', error);
  }
}

async function startPolling() {
  console.log('🤖 Starting Hehe Miner Bot...');
  console.log('📱 Send /start to @HeheMinerBot to test!');
  console.log('🔗 Bot: https://t.me/HeheMinerBot');
  console.log('🔗 Web App: https://hehe-miner.vercel.app');
  console.log('⏹️  Press Ctrl+C to stop\n');
  
  while (true) {
    await getUpdates();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  }
}

// Start the bot
startPolling().catch(console.error);

// Setup Bot Welcome Message for Hehe Miner
const BOT_TOKEN = '8012094721:AAE2mRgi-UgUCSjTSj5gpMyrEb3cbOV608o';

async function setupBotWelcome() {
  console.log('🤖 Setting up bot welcome message...\n');

  try {
    // Test the bot by getting updates (this will show recent messages)
    console.log('📱 Testing bot connection...');
    const updatesResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const updates = await updatesResponse.json();
    
    if (updates.ok) {
      console.log('✅ Bot connection successful!');
      console.log(`📊 Recent updates: ${updates.result.length} messages`);
      
      if (updates.result.length > 0) {
        const lastUpdate = updates.result[updates.result.length - 1];
        if (lastUpdate.message) {
          const chatId = lastUpdate.message.chat.id;
          const userName = lastUpdate.message.from.first_name;
          
          console.log(`\n👤 Last user: ${userName} (Chat ID: ${chatId})`);
          console.log('🚀 Sending welcome message to last user...');
          
          // Send welcome message with web app button
          const welcomeResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🎮 Welcome to Hehe Miner, ${userName}!\n\n⛏️ Start mining HEHE tokens now!\n💰 Earn rewards every 4 hours\n👥 Refer friends for bonus tokens\n🚀 Upgrade your mining power\n\nClick the button below to start your mining journey!`,
              reply_markup: {
                inline_keyboard: [[
                  {
                    text: "🚀 Launch Hehe Miner",
                    web_app: { url: "https://hehe-miner.vercel.app" }
                  }
                ]]
              }
            })
          });
          
          const welcomeResult = await welcomeResponse.json();
          if (welcomeResult.ok) {
            console.log('✅ Welcome message sent successfully!');
          } else {
            console.log('❌ Failed to send welcome message:', welcomeResult);
          }
        }
      } else {
        console.log('📝 No recent messages found. Send /start to your bot first!');
      }
    }

    console.log('\n📋 Bot Commands Available:');
    console.log('   /start - Welcome message with launch button');
    console.log('   /mine - Start mining');
    console.log('   /balance - Check balance');
    console.log('   /tasks - View tasks');
    console.log('   /referral - Get referral link');
    console.log('   /help - Get help');

    console.log('\n🔗 Your Bot: https://t.me/HeheMinerBot');
    console.log('🔗 Web App: https://hehe-miner.vercel.app');
    
    console.log('\n📱 To test:');
    console.log('1. Open https://t.me/HeheMinerBot');
    console.log('2. Send /start');
    console.log('3. Click "🚀 Launch Hehe Miner" button');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupBotWelcome();

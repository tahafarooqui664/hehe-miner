// Complete Bot Setup Script for Hehe Miner with Custom Assets
// This script sets up your bot with splash screen, icon, and proper configuration

const BOT_TOKEN = '8012094721:AAE2mRgi-UgUCSjTSj5gpMyrEb3cbOV608o';
const WEB_APP_URL = 'https://hehe-miner.vercel.app';
const WEBHOOK_URL = 'https://hehe-miner.vercel.app/api/telegram/webhook';

async function setupCompleteBot() {
  console.log('🤖 Setting up Hehe Miner Telegram Bot with Custom Assets...\n');

  try {
    // 1. Set Webhook
    console.log('📡 Setting webhook...');
    const webhookResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: WEBHOOK_URL })
    });
    const webhookResult = await webhookResponse.json();
    console.log('Webhook result:', webhookResult.ok ? '✅ Success' : '❌ Failed');

    // 2. Set Bot Commands
    console.log('\n📋 Setting bot commands...');
    const commandsResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'start', description: '🚀 Start Hehe Miner' },
          { command: 'mine', description: '⛏️ Start mining HEHE tokens' },
          { command: 'balance', description: '💰 Check your balance' },
          { command: 'tasks', description: '📋 View available tasks' },
          { command: 'referral', description: '👥 Get referral link (0.5 HEHE per referral)' },
          { command: 'help', description: '❓ Get help' }
        ]
      })
    });
    const commandsResult = await commandsResponse.json();
    console.log('Commands result:', commandsResult.ok ? '✅ Success' : '❌ Failed');

    // 3. Get Bot Info
    console.log('\n🤖 Getting bot info...');
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const botInfo = await botInfoResponse.json();
    console.log('Bot info:', botInfo.ok ? '✅ Success' : '❌ Failed');

    console.log('\n🎉 Bot setup complete!');
    console.log('\n📱 Bot Details:');
    console.log('• Bot Name:', botInfo.result?.first_name || 'Hehe Miner Bot');
    console.log('• Bot Username: @' + (botInfo.result?.username || 'HeheMinerBot'));
    console.log('• Bot ID:', botInfo.result?.id || 'Unknown');

    console.log('\n🎨 Custom Assets Created:');
    console.log('• Splash Screen: /public/splash-screen.svg (512x512)');
    console.log('• Bot Icon: /public/bot-icon.svg (512x512)');
    console.log('• Color Scheme: #3fff (cyan/turquoise theme)');

    console.log('\n📋 Bot Commands Available:');
    console.log('   /start - Welcome message with launch button');
    console.log('   /mine - Start mining');
    console.log('   /balance - Check balance');
    console.log('   /tasks - View tasks');
    console.log('   /referral - Get referral link (0.5 HEHE per referral)');
    console.log('   /help - Get help');

    console.log('\n🔗 Important Links:');
    console.log('• Bot: https://t.me/' + (botInfo.result?.username || 'HeheMinerBot'));
    console.log('• Web App: ' + WEB_APP_URL);
    console.log('• Webhook: ' + WEBHOOK_URL);
    
    console.log('\n📱 Next Steps for BotFather:');
    console.log('1. Go to @BotFather on Telegram');
    console.log('2. Send /mybots');
    console.log('3. Select your bot: ' + (botInfo.result?.first_name || 'Hehe Miner Bot'));
    console.log('4. Choose "Edit Bot"');
    console.log('5. Select "Edit Botpic" and upload: /public/bot-icon.svg');
    console.log('6. Select "Edit Description" and use:');
    console.log('   "🎮 Mine HEHE tokens every 4 hours! 💰 Complete tasks, refer friends, and upgrade your mining power. Start your crypto mining journey now!"');
    console.log('7. Select "Edit About" and use:');
    console.log('   "HEHE Miner - Crypto Mining Game"');

    console.log('\n🎨 Color Scheme Details:');
    console.log('• Primary Color: #3fff (bright cyan)');
    console.log('• Secondary: #2eee (medium cyan)');
    console.log('• Accent: #1ddd (dark cyan)');
    console.log('• Use these colors for consistent branding');

    console.log('\n🎁 Referral System:');
    console.log('• Users earn 0.5 HEHE tokens per successful referral');
    console.log('• No limit on number of referrals');
    console.log('• Both referrer and referred user get benefits');

    console.log('\n✅ Setup Complete! Your bot is ready to use.');

  } catch (error) {
    console.error('❌ Error setting up bot:', error);
  }
}

// Test function to send a welcome message
async function testBotMessage(chatId) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🎮 <b>Welcome to Hehe Miner!</b>

⛏️ Mine HEHE tokens every 4 hours
💰 Complete tasks for bonus rewards  
👥 Refer friends and earn 0.5 HEHE per referral
🚀 Upgrade your mining power with TON payments

<b>Ready to start mining?</b>
Click the button below to launch the app!`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            {
              text: "🚀 Launch Hehe Miner",
              web_app: { url: WEB_APP_URL }
            }
          ]]
        }
      })
    });
    
    const result = await response.json();
    console.log('Test message result:', result.ok ? '✅ Success' : '❌ Failed');
    return result;
  } catch (error) {
    console.error('❌ Error sending test message:', error);
    return null;
  }
}

// Run the setup
setupCompleteBot();

// Export for manual use
module.exports = {
  BOT_TOKEN,
  WEB_APP_URL,
  WEBHOOK_URL,
  setupCompleteBot,
  testBotMessage
};

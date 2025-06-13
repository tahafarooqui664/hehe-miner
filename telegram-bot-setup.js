// Telegram Bot Setup Script for Hehe Miner
// Run this script to configure your bot

const BOT_TOKEN = '8012094721:AAE2mRgi-UgUCSjTSj5gpMyrEb3cbOV608o';
const WEB_APP_URL = 'https://hehe-miner.vercel.app';
const WEBHOOK_URL = 'https://hehe-miner.vercel.app/api/telegram/webhook';

async function setupBot() {
  console.log('🤖 Setting up Hehe Miner Telegram Bot...\n');

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
          { command: 'referral', description: '👥 Get referral link' },
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
    
    if (botInfo.ok) {
      console.log('✅ Bot Info:');
      console.log(`   Name: ${botInfo.result.first_name}`);
      console.log(`   Username: @${botInfo.result.username}`);
      console.log(`   ID: ${botInfo.result.id}`);
    }

    console.log('\n🎉 Bot setup complete!');
    console.log('\n📱 Next steps:');
    console.log('1. Search for your bot on Telegram: @' + (botInfo.result?.username || 'your_bot_username'));
    console.log('2. Send /start to your bot');
    console.log('3. The bot will show a "Launch Hehe Miner" button');
    console.log('4. Click the button to open your web app!');
    
    console.log('\n🔗 Web App URL: ' + WEB_APP_URL);
    console.log('🔗 Bot Link: https://t.me/' + (botInfo.result?.username || 'your_bot_username'));

  } catch (error) {
    console.error('❌ Error setting up bot:', error);
  }
}

// Run the setup
setupBot();

// Export for manual use
module.exports = {
  BOT_TOKEN,
  WEB_APP_URL,
  WEBHOOK_URL,
  setupBot
};

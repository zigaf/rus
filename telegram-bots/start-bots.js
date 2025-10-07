const { Telegraf } = require('telegraf');
require('dotenv').config();

// Bot 1 - Article Search Bot
const bot1 = new Telegraf(process.env.BOT1_TOKEN || '7968078678:AAEVs4105R2rq4emfT7Qd2K7N5Go4XgDK3I');

bot1.start((ctx) => {
  const welcomeMessage = `
🏥 *Вітаємо в медичному боті Руслани Москаленко!*

Я допоможу вам знайти корисну інформацію про:
• Рак легень та його діагностику
• Сучасні методи лікування
• Профілактику захворювань
• Хірургічні процедури
• Реабілітацію після лікування

🔍 *Як користуватися:*
• Напишіть ключові слова для пошуку
• Якщо не знайшли потрібну інформацію - напишіть "запитати лікаря"

_Лікар-онколог Руслана Москаленко спеціалізується на торакальній хірургії та онкології легень._
  `;
  ctx.replyWithMarkdown(welcomeMessage);
});

bot1.help((ctx) => {
  const helpMessage = `
📖 *Довідка по боту*

🔍 *Пошук статей:*
• Напишіть будь-яке питання або ключові слова
• Наприклад: "симптоми раку", "діагностика", "лікування"

❓ *Якщо не знайшли відповідь:*
• Напишіть "запитати лікаря"
• Ваше питання буде передано доктору
• Ви отримаєте персональну відповідь

🌐 *Повна інформація на сайті:*
https://rus-production.up.railway.app/
  `;
  ctx.replyWithMarkdown(helpMessage);
});

bot1.on('text', async (ctx) => {
  const query = ctx.message.text.toLowerCase();
  
  if (query.includes('запитати лікаря') || query.includes('лікар') || query.includes('питання')) {
    // Send question to doctor channel via bot2
    await sendQuestionToDoctor(ctx.from, ctx.message.text);
    await ctx.reply('✅ *Ваше питання відправлено лікарю!*\n\n⏰ Ви отримаєте відповідь протягом 24-48 годин.');
  } else {
    // Search articles (simplified for now)
    await ctx.reply('🔍 *Шукаю інформацію...*\n\n📝 За вашим запитом знайдено кілька статей. Перегляньте їх на сайті: https://rus-production.up.railway.app/\n\n❓ *Не знайшли потрібну інформацію?* Напишіть "запитати лікаря"');
  }
});

// Bot 2 - Doctor Questions Bot
const bot2 = new Telegraf(process.env.BOT2_TOKEN || '8441781301:AAGJEVkSSvBLR-j7qV2LskYnSBBSprOGQ5E');
const doctorChannelId = process.env.DOCTOR_CHANNEL_ID || '-1003176317968';

bot2.start((ctx) => {
  const welcomeMessage = `
👩‍⚕️ *Бот для питань до лікаря*

Цей бот призначений для отримання питань від пацієнтів та їх передачі лікарю Руслані Москаленко.

🔗 *Пов'язаний з основним ботом:* @moskalenko_helper_bot
  `;
  ctx.replyWithMarkdown(welcomeMessage);
});

// Function to send question to doctor channel
async function sendQuestionToDoctor(user, question) {
  try {
    const userInfo = formatUserInfo(user);
    const timestamp = new Date().toLocaleString('uk-UA');
    const questionId = Date.now().toString();
    
    const message = `
❓ *НОВЕ ПИТАННЯ ВІД ПАЦІЄНТА*

🆔 *ID питання:* ${questionId}
📅 *Дата:* ${timestamp}

👤 *Пацієнт:*
${userInfo}

❓ *Питання:*
${question}

📊 *Статус:* Очікує відповіді

💬 *Для відповіді:* Відповідь на це повідомлення
    `;

    // Send to doctor channel
    await bot2.telegram.sendMessage(doctorChannelId, message, {
      parse_mode: 'Markdown'
    });

    console.log(`Question ${questionId} sent to doctor channel`);
    return true;
  } catch (error) {
    console.error('Error sending question to doctor:', error);
    return false;
  }
}

function formatUserInfo(user) {
  let info = `🆔 ID: ${user.id}\n`;
  
  if (user.first_name) {
    info += `👤 Ім'я: ${user.first_name}`;
    if (user.last_name) info += ` ${user.last_name}`;
    info += '\n';
  }
  
  if (user.username) {
    info += `📱 Username: @${user.username}\n`;
  }
  
  return info;
}

// Launch bots
bot1.launch();
bot2.launch();

console.log('🚀 Telegram bots started successfully!');
console.log(`📱 Bot 1 (Article Search): @moskalenko_helper_bot`);
console.log(`👩‍⚕️ Bot 2 (Doctor Questions): @ruslana_medical_bot`);
console.log(`📺 Doctor Channel: ${doctorChannelId}`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down bots...');
  bot1.stop();
  bot2.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down bots...');
  bot1.stop();
  bot2.stop();
  process.exit(0);
});

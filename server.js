const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ✅ Функция для экранирования спецсимволов в MarkdownV2
function escapeMarkdown(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/~/g, '\\~')
    .replace(/\|/g, '\\|')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/%/g, '\\%')
    .replace(/!/g, '\\!');
}

async function sendToTelegram(botToken, chatId, text) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true
    })
  });
  
  const result = await response.json();
  
  if (!result.ok) {
    throw new Error(`Telegram API error: ${result.description}`);
  }
  
  return result;
}

app.post('/api/order', async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    const { name, phone, address, note, items, total, user_id } = req.body;
    const BOT_TOKEN = '8467789771:AAHa7YBRUXSzz3P3pOViRINIS1Lzwg3YJ2c';

    const ADMIN_CHAT_ID = 413921406;
    const COURIER_CHAT_ID = -4826021986;
    const MANAGER_CHAT_ID = -4856512386;

    let text = `👤 *Имя:* ${escapeMarkdown(name)}\\n`;
    text += `📞 *Телефон:* [${phone}](tel:${phone}) ⭐\\n`;
    text += `🏠 *Адрес:* ${escapeMarkdown(address)}\\n`;
    
    if (note && note.trim().length > 0) {
      text += `📝 *Примечание:* ${escapeMarkdown(note)}\\n`;
    }
    
    text += `\\n🍽 *Блюда:*\\n`;
    
    items.forEach(item => {
      text += `• ${item.name} \\(${item.price}₽\\)\\n`;
    });
    
    text += `\\n💰 *Итого:* ${total}₽`;

    const adminText = `📦 *НОВЫЙ ЗАКАЗ!*\\n\\n${text}`;
    const courierText = `🚴 *ЗАКАЗ ДЛЯ КУРЬЕРА*\\n\\n${text}\\n\\n📞 *Звонить:* [${phone}](tel:${phone})`;
    const managerText = `📊 *ЗАКАЗ ДЛЯ МЕНЕДЖЕРА*\\n\\n${text}`;

    await sendToTelegram(BOT_TOKEN, ADMIN_CHAT_ID, adminText);
    await sendToTelegram(BOT_TOKEN, COURIER_CHAT_ID, courierText);
    await sendToTelegram(BOT_TOKEN, MANAGER_CHAT_ID, managerText);

    res.json({ success: true });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.options('/api/order', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.status(200).end();
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

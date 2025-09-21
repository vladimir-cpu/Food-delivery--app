const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://vladimir-cpu.github.io');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Функция для экранирования спецсимволов в MarkdownV2
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
    const { name, phone, address, note, items, total } = req.body;
    const BOT_TOKEN = '8467789771:AAHa7YBRUX5zZ3P3p0ViRINIS1Lzwg3YJ2c';

    const ADMIN_CHAT_ID = 413921406;
    const COURIER_CHAT_ID = -4826021986;
    const MANAGER_CHAT_ID = -4856512386;

    let text = `*Имя:* ${escapeMarkdown(name)}\n`;
    text += `*Телефон:* [${phone}](tel:${phone})\n`;
    text += `*Адрес:* ${escapeMarkdown(address)}\n`;

    if (note && note.trim().length > 0) {
      text += `*Примечание:* ${escapeMarkdown(note)}\n`;
    }

    text += '\n*Блюда:*\n';

    items.forEach(item => {
      text += `• ${escapeMarkdown(item.name)} (${item.price}р)\n`;
    });

    text += `\n*Итого:* ${total}р`;

    const adminText = `*НОВЫЙ ЗАКАЗ!*\n\n${text}`;
    const courierText = `*ЗАКАЗ ДЛЯ КУРЬЕРА*\n\n${text}\n\n*Звонить:* [${phone}](tel:${phone})`;
    const managerText = `*ЗАКАЗ ДЛЯ МЕНЕДЖЕРА*\n\n${text}`;

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
  res.status(200).end();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

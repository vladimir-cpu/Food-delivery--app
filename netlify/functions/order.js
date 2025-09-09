      const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // ⚡ CORS - разрешаем запросы из браузеров
  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 200, 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type', 
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }, 
      body: '' 
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Только POST запросы' }) 
    };
  }

  try {
    const { name, phone, address, items, total, user_id } = JSON.parse(event.body);
    const BOT_TOKEN = process.env.BOT_TOKEN;
    
    // 🎯 НАСТРОЙКА ЧАТОВ (ОБНОВЛЕННЫЕ ID!)
    const ADMIN_CHAT_ID = 413921406;       // 👑 Ваш личный чат
    const COURIER_CHAT_ID = -4826021986;   // 🚴 Чат курьеров
    const MANAGER_CHAT_ID = -4856512386;   // 📊 Чат менеджеров

    // ✨ ФОРМАТИРУЕМ ТЕКСТ
    let text = `👤 *Имя:* ${name}\\n`;
    text += `📞 *Телефон:* [${phone}](tel:${phone}) ⭐\\n`;
    text += `🏠 *Адрес:* ${address}\\n\\n`;
    text += `🍽 *Блюда:*\\n`;
    
    items.forEach(item => {
      text += `• ${item.name} \\(${item.price}₽\\)\\n`;
    });
    
    text += `\\n💰 *Итого:* ${total}₽`;

    // 🎭 РАЗНЫЕ СООБЩЕНИЯ ДЛЯ РАЗНЫХ РОЛЕЙ
    const adminText = `📦 *НОВЫЙ ЗАКАЗ!*\\n\\n${text}`;
    const courierText = `🚴 *ЗАКАЗ ДЛЯ КУРЬЕРА*\\n\\n${text}\\n\\n📞 *Звонить:* [${phone}](tel:${phone})`;
    const managerText = `📊 *ЗАКАЗ ДЛЯ МЕНЕДЖЕРА*\\n\\n${text}`;

    // 📤 ОТПРАВКА ВО ВСЕ ЧАТЫ
    await sendToTelegram(BOT_TOKEN, ADMIN_CHAT_ID, adminText);
    await sendToTelegram(BOT_TOKEN, COURIER_CHAT_ID, courierText);
    await sendToTelegram(BOT_TOKEN, MANAGER_CHAT_ID, managerText);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};

// 📨 ФУНКЦИЯ ОТПРАВКИ
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

const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// CORS middleware
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'https://vladimir-cpu.github.io');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Простая функция отправки в Telegram
async function sendToTelegram(botToken, chatId, text) {
  const url = 'https://api.telegram.org/bot' + botToken + '/sendMessage';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  });
  
  return await response.json();
}

// Обработчик заказов
app.post('/api/order', async function(req, res) {
  try {
    const orderData = req.body;
    const BOT_TOKEN = '8467789771:AAHa7YBRUX5zZ3P3p0ViRINIS1Lzwg3YJ2c';
    
    const ADMIN_CHAT_ID = 413921406;
    const COURIER_CHAT_ID = -4826021986;
    const MANAGER_CHAT_ID = -4856512386;

    // Формируем текст сообщения с HTML разметкой
    let text = '<b>НОВЫЙ ЗАКАЗ!</b>\n\n';
    text += '<b>Имя:</b> ' + orderData.name + '\n';
    text += '<b>Телефон:</b> ' + orderData.phone + '\n';
    text += '<b>Адрес:</b> ' + orderData.address + '\n';
    
    if (orderData.note && orderData.note.trim().length > 0) {
      text += '<b>Примечание:</b> ' + orderData.note + '\n';
    }
    
    text += '\n<b>Блюда:</b>\n';
    
    orderData.items.forEach(function(item) {
      text += '• ' + item.name + ' (' + item.price + 'р)\n';
    });
    
    text += '\n<b>Итого:</b> ' + orderData.total + 'р';

    // Отправляем в три чата
    await sendToTelegram(BOT_TOKEN, ADMIN_CHAT_ID, text);
    await sendToTelegram(BOT_TOKEN, COURIER_CHAT_ID, text);
    await sendToTelegram(BOT_TOKEN, MANAGER_CHAT_ID, text);

    res.json({ success: true });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.options('/api/order', function(req, res) {
  res.status(200).end();
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', function() {
  console.log('Server running on port ' + PORT);
});

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // CORS для локального тестирования
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
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Только POST запросы' })
    }; 
  }

  try {
    const { name, phone, address, items, total, user_id } = JSON.parse(event.body);
    const BOT_TOKEN = process.env.BOT_TOKEN; 
    const CHAT_ID = user_id;

    let text = `*НОВЫЙ заказ!* \n\n`;
    text += `*Имя:* ${name}\n`;
    text += `*Телефон:* ${phone}\n`;
    text += `*Адрес:* ${address}\n\n`;
    text += `*Блюда:*\n`;
    
    items.forEach(item => {
      text += `${item.name} (${item.price}₽)\n`;
    });
    
    text += `\n💰 *Итого:* ${total}₽`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`; 

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();

    if (result.ok) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true })
      };
    } else {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: result.description })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};

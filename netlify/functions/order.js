exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Только POST запросы' })
    };
  }

  const { name, phone, address, items, total, user_id } = JSON.parse(event.body);

  const BOT_TOKEN = '8467789771:AAHa7YBRUXSzz3P3pOViRINIS1Lzwg3YJ2c';
  const CHAT_ID = user_id;

  let text = `📦 *Новый заказ!* \n\n`;
  text += `👤 *Имя:* ${name}\n`;
  text += `📞 *Телефон:* ${phone}\n`;
  text += `🏠 *Адрес:* ${address}\n\n`;
  text += `📋 *Блюда:*\n`;
  items.forEach(item => {
    text += `— ${item.name} (${item.price}₽)\n`;
  });
  text += `\n💰 *Итого:* ${total}₽`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();
    if (result.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result.description })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

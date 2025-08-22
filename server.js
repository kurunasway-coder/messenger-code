const WebSocket = require('ws');
const wss = new WebSocket.Server('https://celebrated-donut-c4da58.netlify.app'); // Render сам назначит порт

// Хранилище для сообщений (в реальном приложении используйте БД)
let messages = [];

wss.on('connection', function connection(ws) {
  console.log('Новое подключение установлено');

  // При подключении нового клиента отправим ему историю сообщений
  ws.send(JSON.stringify({ type: 'history', data: messages }));

  ws.on('message', function incoming(data) {
    console.log('Получено сообщение: %s', data);

    // Парсим полученное сообщение
    const parsedData = JSON.parse(data);
    const message = {
      id: Date.now(), // уникальный ID на основе времени
      user: parsedData.user,
      text: parsedData.text,
      time: new Date().toLocaleTimeString()
    };

    // Добавляем сообщение в историю
    messages.push(message);
    // Оставляем только последние 100 сообщений
    messages = messages.slice(-100);

    // Рассылаем сообщение ВСЕМ подключенным клиентам
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'message', data: message }));
      }
    });
  });

  ws.on('close', () => {
    console.log('Подключение закрыто');
  });
});

console.log('WebSocket сервер запущен на порту ' + (process.env.PORT || 8080));

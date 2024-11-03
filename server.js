const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use('/static', express.static('static'));

// ルートハンドラー
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/templates/index.html'); // index.htmlのパスを指定
});

// WebSocketの接続イベント
io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

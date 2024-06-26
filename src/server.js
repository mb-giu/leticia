const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const amqp = require('amqplib');

const app = express();
app.use(bodyParser.json());

const secretKey = 'secretKey';
const users = [{ id: 1, email: 'user1@example.com', password: 'senha321' }];
const messages = [];

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const token = jwt.sign({ userId: user.id, password: user.password }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Invalid email or password');
  }
});

app.post('/send', verifyToken, async (req, res) => {
  const { userIdSend, userIdReceive, message } = req.body;
  messages.push({ userIdSend, userIdReceive, message });

  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue('message_queue', { durable: true });
  channel.sendToQueue('message_queue', Buffer.from(JSON.stringify(req.body)));
  await channel.close();
  await connection.close();

  res.send('Message sent');
});

function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).send('No token provided');
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send('Invalid token');
  }
}

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

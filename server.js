const express = require('express');
const { createHash } = require('crypto');
const ecc = require('tiny-secp256k1');
const app = express();
const bodyParser = require("body-parser");
const path = require('path');

const port = 3080;
const users = [];

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../cipher-seal-app/build')));

app.get('/api/users', (req, res) => {
  console.log('GET api/users called!')
  res.json(users);
});

app.post('/api/user', async (req, res) => {
  const { publicKey, signature, payload } = req.body;

  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(JSON.stringify(payload));
  const payloadHash = createHash('sha256').update(encodedPayload, 'utf8').digest('base64');

  const verified = ecc.verify(
    Buffer.from(payloadHash, 'base64'),
    Buffer.from(publicKey),
    Buffer.from(signature),
  );

  const { user } = payload;
  users.push(user);
  res.json({ verified, user });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../cipher-seal-app/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});

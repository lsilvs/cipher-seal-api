const express = require('express');
const { createHash } = require('crypto');
const ecc = require('tiny-secp256k1');
const app = express();
const bodyParser = require("body-parser");
const path = require('path');

const port = 3080;
const users = [];

const validateRequestSignature = (req, res, next) => {
  const { publicKey, signature, payload } = req.body;

  if (!publicKey || !signature || !payload) {
    res.status(422).send('Unprocessable Entity: Public Key, Signature and Payload are required to process the request.')
    return
  }

  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(JSON.stringify(payload));
  const payloadHash = createHash('sha256').update(encodedPayload, 'utf8').digest('base64');

  const verified = ecc.verify(
    Buffer.from(payloadHash, 'base64'),
    Buffer.from(publicKey),
    Buffer.from(signature),
  );

  if (!verified) {
    res.status(401).send('Unauthorized: Signature provided does not match.')
    return
  }

  next()
  return
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../cipher-seal-app/build')));
app.use(validateRequestSignature);

app.get('/api/users', (req, res) => {
  console.log('GET api/users called!')
  res.json(users);
});

app.post('/api/user', async (req, res) => {
  const { user } = req.body.payload;
  users.push(user);
  res.json({ user });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../cipher-seal-app/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});

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
    Buffer.from(publicKey, 'base64'),
    Buffer.from(signature, 'base64'),
  );

  if (!verified) {
    res.status(401).send('Unauthorized: Signature provided does not match.')
    return
  }

  next()
  return
}

const createUser = (req, res) => {
  const { publicKey, signature, payload } = req.body;
  const user = users.find(user => user.publicKey === publicKey)
  if (user) {
    res.status(409).send('Conflict: User already registered.')
    return
  }
  users.push({ publicKey, signature, payload });
  res.json({ success: true });
}

const loginUser = (req, res) => {
  const { publicKey } = req.body;
  const user = users.find(user => user.publicKey === publicKey)
  if (!user) {
    res.status(404).send('Not Found: User not found.')
    return
  }
  res.json({ success: true, user: user.payload.user });
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../cipher-seal-app/build')));
app.use(validateRequestSignature);

app.post('/api', (req, res) => {
  const { action } = req.body.payload;

  switch (action) {
    case 'createUser':
      createUser(req, res)
      break;
    case 'loginUser':
      loginUser(req, res)
      break;
    case 'getAllUsers':
      res.json(users);
      break;
    default:
      break;
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../cipher-seal-app/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});

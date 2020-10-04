const express = require('express');
const { createHash } = require('crypto');
const ecc = require('tiny-secp256k1');
const app = express();
const bodyParser = require("body-parser");
const path = require('path');
const {
  getInitialTweets,
  getUser,
  setUser,
  saveTweet: saveTweetAPI,
} = require('./utils/api');

const port = 3080;

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

const createUser = async (req, res) => {
  const { publicKey, payload } = req.body;
  const registeredUser = await getUser(publicKey);
  if (registeredUser) {
    res.status(409).send('Conflict: User already registered.')
    return
  }
  const newUser = await setUser({ publicKey, username: payload.username });
  res.json({ success: true, user: newUser });
}

const loginUser = async (req, res) => {
  const { publicKey } = req.body;
  const registeredUser = await getUser(publicKey);
  if (!registeredUser) {
    res.status(404).send('Not Found: User not found.')
    return
  }
  res.json({ success: true, user });
}

const saveTweet = async (req, res) => {
  const { publicKey, signature, payload } = req.body;
  const registeredUser = await getUser(publicKey);
  if (!registeredUser) {
    res.status(404).send('Not Found: User not found.')
    return
  }

  const tweet = {
    text: payload.tweet.text,
    author: publicKey,
    signature,
  }

  await saveTweetAPI(tweet)
  res.json({ success: true, tweet });
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../cipher-seal-app/build')));
app.use(validateRequestSignature);

app.post('/api', async (req, res) => {
  const { action } = req.body.payload;

  switch (action) {
    case 'createUser':
      createUser(req, res)
      break;
    case 'loginUser':
      loginUser(req, res)
      break;
    case 'getAllTweets':
      res.json(await getInitialTweets());
      break;
    case 'saveTweet':
      saveTweet(req, res)
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

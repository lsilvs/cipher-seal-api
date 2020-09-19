const express = require('express');
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
  console.log('POST api/user called!')
  const { user } = req.body;
  users.push(user);
  res.json({ user });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../cipher-seal-app/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});

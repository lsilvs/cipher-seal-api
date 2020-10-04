const {
  _getUsers,
  _setUser,
  _getTweets,
  _saveLikeToggle,
  _saveTweet,
} = require('./_DATA');

function getInitialTweets() {
  return Promise.all([
    _getUsers(),
    _getTweets(),
  ]).then(([users, tweets]) => ({
    users,
    tweets,
  }));
}

async function getUser(publicKey) {
  const users = await _getUsers();
  return users[publicKey];
}

async function setUser({ publicKey, username }) {
  const user = await _setUser({ publicKey, username });
  return user;
}

function saveLikeToggle(info) {
  return _saveLikeToggle(info);
}

function saveTweet(info) {
  return _saveTweet(info);
}

module.exports = {
  getInitialTweets,
  getUser,
  setUser,
  saveLikeToggle,
  saveTweet,
};

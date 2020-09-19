## Cipher Seal API

This project is an experiment aiming to use digital signature as authentication method for a client/server architecture.<br />
User's profile are identified by their public keys and every request needs to be signed by their private key to be consider valid.<br />
No login, no password, no 2FA. Just cryptography.<br />
The keypairs are generated from a passphrase which can be used to "login".

### How to use

`npm install`<br />
`npm run dev`<br />
The API will listen on [http://localhost:3080](http://localhost:3080).

In order to try out this project you can use the [Cipher Seal APP](https://github.com/lsilvs/cipher-seal-app)<br />

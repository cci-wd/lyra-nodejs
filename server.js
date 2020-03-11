const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();

const Client = require('./client.js').default;

const epay = new Client({
  username: 69876357,
  endpoint: 'https://api.payzen.eu',
  hashKey: '38453613e7f44dc58732bad3dca2bca3',
  password: 'testpassword_DEMOPRIVATEKEY23G4475zXZQ2UA5x7M',
  publicKey: '69876357:testpublickey_DEMOPUBLICKEY95me92597fd28tGD4r5',
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/epay', async (req, res) => {
  res.render('epay', {
    publicKey: epay.publicKey,
    endpoint: epay.endpoint,
    response: await epay.request('V4/Charge/CreatePayment', {
      amount: 25,
      currency: 'EUR',
      orderId: 'orderId',
      customer: { email: 'foo@bar.nc' },
    }),
  });
});

app.post('/paid', (req, res) => {
  const {
    'kr-hash': hash,
    'kr-hash-key': hashKey,
    'kr-hash-algorithm': hashAlgorithm,
    'kr-answer-type': answerType,
    'kr-answer': answer,
  } = req.body;

  if (!hash) throw new Error('kr-hash not found in POST parameters');
  if (!hashKey) throw new Error('kr-hash-key not found in POST parameters');
  if (!hashAlgorithm) throw new Error('kr-hash-algorithm not found in POST parameters');
  if (!answerType) throw new Error('kr-answer-type not found in POST parameters');
  if (!answer) throw new Error('kr-answer not found in POST parameters');

  res.render('paid', {
    checkHash: epay.checkHash(hashAlgorithm, hashKey, hash, answer),
    parsedAnswer: JSON.parse(answer),
  });
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});

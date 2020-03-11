const fetch = require('node-fetch');
const crypto = require('crypto');

exports.default = class Client {
  static #version = '1.0.0';
  static #timeout = 45;

  #endpoint = null;
  #username = null;
  #password = null;
  #publicKey = null;
  #hashKey = null;

  constructor(config) {
    this.#endpoint = config.endpoint;
    this.#username = config.username;
    this.#password = config.password;
    this.#publicKey = config.publicKey;
    this.#hashKey = config.hashKey;
  }

  set endpoint(endpoint) {
    this.#endpoint = endpoint;
  }

  get endpoint() {
    return this.#endpoint;
  }

  set username(username) {
    this.#username = username;
  }

  get username() {
    return this.#username;
  }

  set password(password) {
    this.#password = password;
  }

  get password() {
    return this.#password;
  }

  set publicKey(publicKey) {
    this.#publicKey = publicKey;
  }

  get publicKey() {
    return this.#publicKey;
  }

  set hashKey(hashKey) {
    this.#hashKey = hashKey;
  }

  get hashKey() {
    return this.#hashKey;
  }

  async request(path, body) {
    if (!this.#username) {
      throw new Error('username is not defined in the SDK');
    }

    if (!this.#password) {
      throw new Error('password is not defined in the SDK');
    }

    if (!this.#endpoint) {
      throw new Error('REST API endpoint not defined in the SDK');
    }

    const response = await fetch(this.#endpoint + '/api-payment/' + path, {
      timeout: Client.timeout,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from(this.#username + ':' + this.#password).toString('base64'),
      },
      body: JSON.stringify(body),
    });

    return await response.json();
  }

  checkHash(hashAlgorithm, hashKey, hashValue, answer, key = null) {
    if (hashAlgorithm !== 'sha256_hmac') {
      throw new Error(
        'hash algorithm not supported:' + hashAlgorithm + '. Update your SDK'
      );
    }

    if (key === null) {
      if (hashKey === 'sha256_hmac') {
        key = this.#hashKey;
      } else if (hashKey === 'password') {
        key = this.#password;
      } else {
        throw new Error('invalid kr-hash-key POST parameter');
      }
    }

    const hash = crypto
      .createHmac('sha256', key)
      .update(Buffer.from(answer, 'utf-8'))
      .digest('hex');

    if (hashValue === hash) return true;

    return false;
  }
};

const client = require('prom-client');
const dotenv = require("dotenv")
const url = require("url")
const axios = require('axios')
const express = require('express')

dotenv.config()
const app = express()
const polygon = JSON.parse(process.env.polygon)
const ethereum = JSON.parse(process.env.ethereum)
const gnosis = JSON.parse(process.env.gnosis)
const wallets = JSON.parse(process.env.wallets)
const PORT = process.env.PORT

app.get('/metrics', async (req, res) => {
  client.register.metrics().then((result) => {
    res.set('Content-Type', client.register.contentType)
    res.send(result)
  }).catch((err) => {
    res.status(500).send(err)
  })
})
console.log(
  `Server listening to ${PORT}, metrics exposed on /metrics endpoint`,
);
app.listen(PORT, '0.0.0.0')

const balance = new client.Gauge({
  name: 'wallet_balance',
  help: 'The Balance of a wallet using native coin',
  labelNames: ['chain', 'token', 'address', 'name'],

});

wallets.forEach(wallet => {
  if (Array.isArray(wallet.chain)) {
    wallet.chain.forEach(element => {
      // wallet.chain = element
      newWallet = {...wallet,chain:element}
      console.debug("Wallet",newWallet);
      getBalance(newWallet)      
    });
  }else{
    console.debug("Wallet",wallet);
    getBalance(wallet)
  }
});

async function getBalance(wallet) {
  switch (wallet.chain) {
    case 'polygon':
      polygonChainBalance(wallet.address).then((wallet_balance) => {
        balance.set({ name: wallet.name, chain: wallet.chain, token: polygon.native_token, address: wallet.address }, wallet_balance)
      }).catch((err) => {
        console.error(err);
      })
      break;


    case 'ethereum':
      ethereumChainBalance(wallet.address).then((wallet_balance) => {
        balance.set({ name: wallet.name, chain: wallet.chain, token: ethereum.native_token, address: wallet.address }, wallet_balance)
      }).catch((err) => {
        console.error(err);
      })
      break;


    case 'gnosis':
      gnosisChainBalance(wallet.address).then((wallet_balance) => {
        balance.set({ name: wallet.name, chain: wallet.chain, token: gnosis.native_token, address: wallet.address }, wallet_balance)
      }).catch((err) => {
        console.error(err);
      })
      break;

    default:
      break;
  }
}
async function polygonChainBalance(address) {
  const requestUrl = url.parse(url.format({
    protocol: 'https',
    hostname: 'api.polygonscan.com',
    pathname: '/api',
    query: {
      "module": "account",
      "action": "balance",
      "address": address,
      "apiKey": polygon.APIKey
    }
  }));
  try {
    const response = await axios.get(requestUrl.href);
    console.debug(response);
    return parseInt(response.data.result) / Math.pow(10, polygon.decimal_point)
  } catch (error) {
    console.log(error.response.body);
  }
}

async function ethereumChainBalance(address) {
  const requestUrl = url.parse(url.format({
    protocol: 'https',
    hostname: 'api.etherscan.io',
    pathname: '/api',
    query: {
      "module": "account",
      "action": "balance",
      "address": address,
      "apiKey": ethereum.APIKey
    }
  }));
  try {
    const response = await axios.get(requestUrl.href);
    console.debug(response);
    return parseInt(response.data.result) / Math.pow(10, ethereum.decimal_point)
  } catch (error) {
    console.log(error.response.body);
  }
}

async function gnosisChainBalance(address) {
  const requestUrl = url.parse(url.format({
    protocol: 'https',
    hostname: 'blockscout.com',
    pathname: '/xdai/mainnet/api',
    query: {
      "module": "account",
      "action": "balance",
      "address": address,
      "apiKey": gnosis.APIKey
    }
  }));
  try {
    const response = await axios.get(requestUrl.href);
    // console.debug(response);
    return parseInt(response.data.result) / Math.pow(10, gnosis.decimal_point)
  } catch (error) {
    console.log(error.response.body);
  }
}
const Web3 = require('web3').default;
import {INFURA_API_KEY} from "@env"

const url = `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;

const web3 = new Web3(url);

web3.eth.net.isListening()
    .then(() => console.log('Connected to Sepolia Testnet'))
    .catch(e => console.log('Failed to connect: ', e.message));


const axios = require('axios');
import {INFURA_API_KEY} from "@env"

const infuraUrl = `https://goerli.infura.io/v3/${INFURA_API_KEY}`;

const data = JSON.stringify({
  jsonrpc: '2.0',
  method: 'eth_blockNumber',
  params: [],
  id: 1,
});

const config = {
  method: 'post',
  url: infuraUrl,
  headers: { 
    'Content-Type': 'application/json',
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.error(error);
});

const url = require("url")
const axios = require('axios')
const client = require('prom-client');



class MetricsService {
    constructor(logger, wallets, chains) {
        if (logger === undefined) {
            throw new Error(`Variable logger is required`)
        }
        this.logger = logger
        if (wallets === undefined) {
            throw new Error('Variable wallets is required')
        }
        this.wallets = wallets
        if (chains === undefined) {
            throw new Error('Variable chains is required')
        }
        this.chains = chains
        this.balance = new client.Gauge({
            name: 'wallet_balance',
            help: 'The Balance of a wallet using native coin',
            labelNames: ['chain', 'token', 'address', 'name'],
          
          });
          
    }

    async getMetrics() {
        await this.fetchBalances()
        this.logger.info("Fetched Balances")
        let metrics = await client.register.metrics()
        let metricsContentType = client.register.contentType
        this.logger.info(`The metrics ${metrics}`)
        return {
            metrics,
            metricsContentType
        }
    }

    async fetchBalances() {
        this.wallets.forEach(wallet => {
            if (Array.isArray(wallet.chain)) {
                wallet.chain.forEach(element => {
                    // wallet.chain = element
                    let newWallet = { ...wallet, chain: element }
                    this.logger.debug("Wallet", newWallet);
                    this.getBalance(newWallet)
                });
            } else {
                this.logger.debug("Wallet", wallet);
                this.getBalance(wallet)
            }
        });
    }

    async getBalance(wallet) {
    switch (wallet.chain) {
        case 'polygon':
            this.polygonChainBalance(wallet.address).then((wallet_balance) => {
                this.balance.set({ name: wallet.name, chain: wallet.chain, token: this.chains.polygon.native_token, address: wallet.address }, wallet_balance)
            }).catch((err) => {
                this.logger.error(err);
            })
            break;


        case 'ethereum':
            this.ethereumChainBalance(wallet.address).then((wallet_balance) => {
                this.balance.set({ name: wallet.name, chain: wallet.chain, token: this.chains.ethereum.native_token, address: wallet.address }, wallet_balance)
            }).catch((err) => {
                this.logger.error(err);
            })
            break;


        case 'gnosis':
            this.gnosisChainBalance(wallet.address).then((wallet_balance) => {
                this.balance.set({ name: wallet.name, chain: wallet.chain, token: this.chains.gnosis.native_token, address: wallet.address }, wallet_balance)
            }).catch((err) => {
                this.logger.error(err);
            })
            break;

        default:
            break;
    }
}


    async polygonChainBalance(address) {
    const requestUrl = url.parse(url.format({
        protocol: 'https',
        hostname: 'api.polygonscan.com',
        pathname: '/api',
        query: {
            "module": "account",
            "action": "balance",
            "address": address,
            "apiKey": this.chains.polygon.APIKey
        }
    }));
    try {
        const response = await axios.get(requestUrl.href);
        this.logger.debug(response);
        return parseInt(response.data.result) / Math.pow(10, this.chains.polygon.decimal_point)
    } catch (error) {
        this.logger.error(error.response.body);
    }
}

    async ethereumChainBalance(address) {
    const requestUrl = url.parse(url.format({
        protocol: 'https',
        hostname: 'api.etherscan.io',
        pathname: '/api',
        query: {
            "module": "account",
            "action": "balance",
            "address": address,
            "apiKey": this.chains.ethereum.APIKey
        }
    }));
    try {
        const response = await axios.get(requestUrl.href);
        this.logger.debug(response);
        return parseInt(response.data.result) / Math.pow(10, this.chains.ethereum.decimal_point)
    } catch (error) {
        this.logger.error(error.response.body);
    }
}

    async gnosisChainBalance(address) {
    const requestUrl = url.parse(url.format({
        protocol: 'https',
        hostname: 'blockscout.com',
        pathname: '/xdai/mainnet/api',
        query: {
            "module": "account",
            "action": "balance",
            "address": address,
            "apiKey": this.chains.gnosis.APIKey
        }
    }));
    try {
        const response = await axios.get(requestUrl.href);
        this.logger.debug(response);
        return parseInt(response.data.result) / Math.pow(10, this.chains.gnosis.decimal_point)
    } catch (error) {
        this.logger.error(error.response.body);
    }
}

close() {

}
}


module.exports = {
    MetricsService,
}
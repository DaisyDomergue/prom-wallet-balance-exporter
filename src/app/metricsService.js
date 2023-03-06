const url = require("url")
const axios = require('axios')
const client = require('prom-client');
const Web3 = require("web3")


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
        this.logger.info("Looping through wallets")
        for (const wallet of this.wallets) {
            if (Array.isArray(wallet.chain)) {
                for (const chain of wallet.chain) {
                    let newWallet = { ...wallet, chain: chain }
                    this.logger.debug("Wallet", newWallet);
                    const wallet_balance = await this.getBalance(newWallet)
                    const token = await this.getChainToken(newWallet.chain)
                    this.balance.set({ name: newWallet.name, chain: newWallet.chain, token: token, address: newWallet.address }, wallet_balance)
                }
            } else {
                this.logger.debug("Wallet", wallet);
                const wallet_balance = await this.getBalance(wallet)
                const token = await this.getChainToken(wallet.chain)
                this.balance.set({ name: wallet.name, chain: wallet.chain, token: token, address: wallet.address }, wallet_balance)

            }
        }
        this.logger.info("Done looping")
    }
    async getChainToken(chain) {
        this.logger.info(this.chains[chain].native_token)
        return this.chains[chain].native_token
    }
    async getBalance(wallet) {
        return new Promise((result, error) => {
            switch (wallet.chain) {
                case 'polygon':
                    this.polygonChainBalance(wallet.address).then((wallet_balance) => {
                        this.logger.info(`Setting wallet ballance for ${wallet.name} value at ${wallet_balance}`)
                        result(wallet_balance)
                    }).catch((err) => {
                        this.logger.error(err);
                        error(err)
                    })
                    break;

                case 'ethereum':
                    this.ethereumChainBalance(wallet.address).then((wallet_balance) => {
                        this.logger.info(`Setting wallet ballance for ${wallet.name} value at ${wallet_balance}`)
                        result(wallet_balance)
                    }).catch((err) => {
                        this.logger.error(err);
                        error(err)
                    })
                    break;

                case 'gnosis':
                    this.gnosisChainBalance(wallet.address).then((wallet_balance) => {
                        this.logger.info(`Setting wallet ballance for ${wallet.name} value at ${wallet_balance}`)
                        result(wallet_balance)
                    }).catch((err) => {
                        this.logger.error(err);
                        error(err)
                    })
                    break;

                case 'paymaster':
                    this.getPaymasterBalance(wallet.address).then((wallet_balance) => {
                        this.logger.info(`Setting wallet ballance for ${wallet.name} value at ${wallet_balance}`)
                        result(wallet_balance)
                    }).catch((err) => {
                        this.logger.error(err);
                        error(err)
                    })
                    break;

                default:
                    break;
            }
        })
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
            hostname: 'api.gnosisscan.io',
            pathname: '/api',
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

    async getPaymasterBalance(address) {
        try {
            const web3 = new Web3(this.chains.paymaster.node)
            let contract = new web3.eth.Contract(JSON.parse(this.chains.paymaster.ABI), address)
            let getRelayHubDeposit = contract.methods.getRelayHubDeposit();
            let balance = await getRelayHubDeposit.call()
            return parseInt(balance) / Math.pow(10, 18)
        } catch (error) {
            this.logger.error(error);
        }
    }

    close() {

    }
}


module.exports = {
    MetricsService,
}
const { ErrorMessage } = require('./ErrorMessage')

class metricsHandler {
	constructor(logger, wallets, chains, metricsService) {
		this.logger = logger
        this.wallets = wallets
        this.chains = chains
		this.metricsService = metricsService
	}

	sendJsonResponse(res, status, response, responseType) {
		res.set('content-type', responseType)
		res.status(status)
		res.send(response)
	}

	sendJsonError(res, status, message) {
		const errorMessage = new ErrorMessage(message)
		this.sendJsonResponse(res, status, errorMessage)
	}

	async handle(req, res) {
		try {
			this.logger.info("Requesting for a handle")
			const {metrics,metricsContentType} = await this.metricsService.getMetrics()
			this.logger.info("Response from get metrics function",metrics)
			this.sendJsonResponse(res, 200, metrics, metricsContentType)
		} catch (err) {
			this.logger.error(err)
			this.sendJsonError(res, 400, err.message)
		}
	}
}

module.exports = {
	metricsHandler,
}
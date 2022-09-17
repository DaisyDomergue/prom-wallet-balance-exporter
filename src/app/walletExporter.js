const client = require('prom-client');
const dotenv = require("dotenv")
const url = require("url")
const axios = require('axios')
const http = require('http')
const pino = require('pino')
const express = require('express')
const signals = Object.freeze({
    'SIGINT': 2,
    'SIGTERM': 15,
})
class walletExporter {
    constructor({
		// HTTP port the server listens on
		port = 9098,
		// Logger (pino) level: one of 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'.
		logLevel = 'info',

		expressApp = express(),
		httpServer = undefined,  /* node http.Server */
		logger = pino({
			name: 'main',
			level: logLevel,
		}),
	} = {}) {
		this.expressApp = expressApp
		this.logger = logger

		if (!httpServer) {
			const httpServerOptions = {
				maxHeaderSize: 4096,
			}
			httpServer = http.createServer(httpServerOptions, expressApp)
		}
		this.httpServer = httpServer

		// Port is the HTTP TCP/IP port.
		this.port = port

		// Listen for Linux Signals
		Object.keys(signals).forEach((signal) => {
			process.on(signal, () => {
				this.httpServer.close(() => {
					this.logger.info(`HTTP server stopped by signal: ${signal}`)
					this.close()
					const invalidExitArg = 128
					const exitCode = invalidExitArg + signals[signal]
					process.exit(exitCode)
				})
			})
		})

		this.routes()
	}
    close() {
        this.joinRequestService.close()
        Object.keys(signals).forEach((signal) => {
            process.removeAllListeners(signal)
        })
        if (!this.server) {
            return
        }
        return new Promise((done, fail) => {
            this.server.close((err) => {
                if (err) {
                    fail(err)
                }
                done()
            })
        })
    }

    routes() {
        this.expressApp.use(express.json({
            limit: '1kb',
        }))
        this.expressApp.post('/metrics', (req, res, next) => new rest.walletExporter(this.logger, this.joinRequestService, this.customJoinRequestValidator).handle(req, res, next))
        this.expressApp.use(rest.error(this.logger))
    }
    listen() {
        const backlog = 511
        return new Promise((done, fail) => {
            this.server = this.expressApp.listen(this.port, backlog, (err) => {
                if (err) {
                    fail(err)
                }
                this.logger.info(`HTTP server started on port: ${this.port}`)
                done()
            })
        })
    }
}
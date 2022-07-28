build-docker:
	docker build . -t daisydomergue/prom-wallet-exporter
docker-run:
	docker run -p 9098:9098 -d daisydomergue/prom-wallet-exporter
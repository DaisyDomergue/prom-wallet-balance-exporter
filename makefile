docker-build:
	docker build . -t daisydomergue/prom-wallet-exporter
docker-run:
	docker run -p 9098:9098 -v /etc/wallet-exporter:/app -d daisydomergue/prom-wallet-exporter
docker-push:
	docker push daisydomergue/prom-wallet-exporter:latest
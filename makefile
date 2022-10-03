docker-build:
	docker build . -t daisydomergue/prom-wallet-exporter
docker-run:
	docker run --name wallet-exporter -p 9098:9098 -v /etc/wallet-exporter:/etc/wallet-exporter -d daisydomergue/prom-wallet-exporter
docker-inspect-image:
	docker run -it -p 9098:9098 -v $(pwd)/config:/usr/src/app/config daisydomergue/prom-wallet-exporter /bin/bash
docker-push:
	docker push daisydomergue/prom-wallet-exporter:latest
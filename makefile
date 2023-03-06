docker-build:
	docker build . -t daisydomergue/prom-wallet-exporter:v1.3
docker-run:
	docker run --name wallet-exporter -p 9098:9098 -v $(pwd)/config:/usr/src/app/config -d daisydomergue/prom-wallet-exporter:v1.3
docker-inspect-image:
	docker run -it -p 9098:9098 -v $(pwd)/config:/usr/src/app/config daisydomergue/prom-wallet-exporter /bin/sh
docker-push:
	docker push daisydomergue/prom-wallet-exporter:v1.3
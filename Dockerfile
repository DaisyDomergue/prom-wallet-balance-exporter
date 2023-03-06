FROM node:16-alpine
WORKDIR /usr/src/app
COPY ./src/ ./src
COPY package.json .
COPY package-lock.json .

ENV port 9098
ENV logger error

RUN npm ci
EXPOSE ${port}
CMD node src/cmd/walletExporter/main.js -l ${logger}

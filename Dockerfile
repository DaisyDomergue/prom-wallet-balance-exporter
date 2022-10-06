from node:16-alpine
WORKDIR /usr/src/app
COPY ./src/ ./src
COPY package.json .
COPY package-lock.json .
RUN npm ci
EXPOSE 9098
CMD ["node", "src/cmd/walletExporter/main.js"]

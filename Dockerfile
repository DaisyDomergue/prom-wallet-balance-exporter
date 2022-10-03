from node:16
WORKDIR /usr/src/app
COPY ./src/ ./src
COPY package.json .
RUN npm install
EXPOSE 9098
CMD ["node", "src/cmd/walletExporter/main.js"]

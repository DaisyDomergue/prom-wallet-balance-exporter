from node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 9098
CMD ["node", "src/cmd/walletExporter/main.js"]

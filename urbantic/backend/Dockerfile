FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

RUN addgroup -S urbantic && adduser -S urbantic -G urbantic
USER urbantic

EXPOSE 4000

CMD ["node", "src/server.js"]

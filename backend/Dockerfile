FROM node:20-alpine as builder
WORKDIR /app
RUN apk add --no-cache python3 py3-pip git
COPY package*.json ./
RUN npm install
COPY tsconfig*.json nest-cli.json ./
COPY prisma ./prisma
COPY src ./src
RUN pip3 install --no-cache-dir semgrep
RUN semgrep scan --config=auto --error
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
ENV NODE_ENV=production
ENTRYPOINT ["./docker-entrypoint.sh"]

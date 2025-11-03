FROM node:18-alpine as deps
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=deps /app/package*.json ./
RUN npm install --omit=dev
COPY --from=deps /app/.next ./.next
COPY --from=deps /app/public ./public
COPY --from=deps /app/next.config.mjs ./
COPY --from=deps /app/tailwind.config.ts ./
COPY --from=deps /app/postcss.config.js ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]

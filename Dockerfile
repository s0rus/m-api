FROM node:18 as builder

WORKDIR usr/src/app

COPY prisma ./

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG DISCORD_BOT_TOKEN
ARG DATABASE_URL

WORKDIR usr/src/app

COPY --from=builder usr/src/app/node_modules ./node_modules
COPY . .
RUN npm ci --only=production
RUN npx prisma generate

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]

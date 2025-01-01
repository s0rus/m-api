FROM oven/bun:1 as base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

FROM base AS production
COPY --from=install /temp/prod/node_modules node_modules
COPY ./prisma ./prisma
COPY ./src ./src
COPY ./tsconfig.json .
COPY --from=prerelease /usr/src/app/package.json .

ENV NODE_ENV=production
ARG DISCORD_BOT_TOKEN
ARG DATABASE_URL
ARG ESSA_API_URL
ARG ESSA_API_V2_URL
ARG ESSA_API_KEY
ARG ESSA_API_KEY_V2
ARG MAPI_AUTH_TOKEN
ARG MAPI_HOSTNAME
ARG TWITCH_CLIENT_ID
ARG TWITCH_CLIENT_SECRET
ARG NOTIFIER_SECRET
ARG NODE_VERSION=20

RUN apt update \
    && apt install -y curl
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n \
    && bash n $NODE_VERSION \
    && rm n \
    && npm install -g n

RUN bunx prisma generate

USER bun
EXPOSE 5000
EXPOSE 8000
ENTRYPOINT [ "bun", "run", "src/index.ts" ]

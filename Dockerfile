FROM node:18 AS base

#
#   Builder
#
FROM base AS builder

WORKDIR /app

# Get lock file
COPY package.json package-lock.json* ./
RUN \
    if [ -f package-lock.json ]; then npm ci; \
    else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && npm install; \
    fi

# Enviornment variables for building
ARG MONGO_URI
ENV MONGO_URI ${MONGO_URI}

ARG DISCORD_BOT_TOKEN
ENV DISCORD_BOT_TOKEN ${DISCORD_BOT_TOKEN}

ARG DISCORD_BOT_CLIENT_ID
ENV DISCORD_BOT_CLIENT_ID ${DISCORD_BOT_CLIENT_ID}

ARG DISCORD_INVITE_LINK
ENV DISCORD_INVITE_LINK ${DISCORD_INVITE_LINK}

ARG BOT_HOMEPAGE
ENV BOT_HOMEPAGE ${BOT_HOMEPAGE}

ARG BOT_STATUS_MESSAGE
ENV BOT_STATUS_MESSAGE ${BOT_STATUS_MESSAGE}

ARG DISCORD_OAUTH2_CALLBACK_URL
ENV DISCORD_OAUTH2_CALLBACK_URL ${DISCORD_OAUTH2_CALLBACK_URL}

ARG DISCORD_OAUTH2_CLIENT_SECRET
ENV DISCORD_OAUTH2_CLIENT_SECRET ${DISCORD_OAUTH2_CLIENT_SECRET}

ARG AUTH_SECRET
ENV AUTH_SECRET ${AUTH_SECRET}

ARG SITE_URL
ENV SITE_URL ${SITE_URL}

ARG YOUTUBE_API_KEY
ENV YOUTUBE_API_KEY ${YOUTUBE_API_KEY}

ARG HMAC_SECRET
ENV HMAC_SECRET ${HMAC_SECRET}

ARG TWITCH_CLIENT_ID
ENV TWITCH_CLIENT_ID ${TWITCH_CLIENT_ID}

ARG TWITCH_CLIENT_SECRET
ENV TWITCH_CLIENT_SECRET ${TWITCH_CLIENT_SECRET}

# Generate from prisma schema
COPY /prisma ./

RUN npx prisma generate

# Copy tsconfig and compile
COPY global.d.ts tsconfig.json ./
COPY src ./src

RUN npm run build

#
#   Runner
#
FROM base AS runner
WORKDIR /app
# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 auxdibot
USER auxdibot

# Copy compiled code
COPY --from=builder --chown=auxdibot:nodejs /app/dist /app/dist

# Copy compiled code
COPY --from=builder --chown=auxdibot:nodejs /app/node_modules /app/node_modules 

# Copy compiled code
COPY --from=builder --chown=auxdibot:nodejs /app/package.json /app 

# Enviornment variables for running
ARG MONGO_URI
ENV MONGO_URI ${MONGO_URI}

ARG DISCORD_BOT_TOKEN
ENV DISCORD_BOT_TOKEN ${DISCORD_BOT_TOKEN}

ARG DISCORD_BOT_CLIENT_ID
ENV DISCORD_BOT_CLIENT_ID ${DISCORD_BOT_CLIENT_ID}

ARG DISCORD_INVITE_LINK
ENV DISCORD_INVITE_LINK ${DISCORD_INVITE_LINK}

ARG BOT_HOMEPAGE
ENV BOT_HOMEPAGE ${BOT_HOMEPAGE}

ARG BOT_STATUS_MESSAGE
ENV BOT_STATUS_MESSAGE ${BOT_STATUS_MESSAGE}

# Expose ports
EXPOSE 1080

# Run the application
CMD [ "node", "./dist/index.js" ]
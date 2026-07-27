# ---- deps stage ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- runtime stage ----
FROM node:20-alpine
WORKDIR /app

# whisper.cpp needs a C++ runtime; ffmpeg is used for audio conversion
RUN apk add --no-cache ffmpeg

# Copy only production dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Uploads and chats are persisted via Docker volumes, not baked into the image
VOLUME ["/app/src/uploads", "/app/src/chats"]

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]

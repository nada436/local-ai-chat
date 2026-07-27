# ---- deps stage ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Use npm install instead of npm ci because the lock file is currently out of
# sync with package.json. Once you run `npm install` locally and commit the
# updated package-lock.json, change this back to: npm ci --omit=dev
RUN npm install --omit=dev

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

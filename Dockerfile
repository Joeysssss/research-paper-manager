FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY package.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for both backend and frontend
RUN npm run install:all

# Copy all source files
COPY . .

# Build frontend production bundle
RUN npm run build:frontend

# Expose server port
ENV PORT=5000
ENV NODE_ENV=production
EXPOSE 5000

# Start unified full-stack server
CMD ["npm", "start"]

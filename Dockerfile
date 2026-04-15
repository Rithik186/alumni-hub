# Stage 1: Build the React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build frontend
COPY . .
RUN npm run build

# Stage 2: Setup the Production Node.js Server
FROM node:20-alpine

WORKDIR /app

# Copy package.json and install ONLY production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built Vite frontend from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the backend files and server configuration
# (Note: .dockerignore prevents copying node_modules, .env, etc.)
COPY . .

# Expose the API port
EXPOSE 5000

# Set environment to production to trigger server.js static serving
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]

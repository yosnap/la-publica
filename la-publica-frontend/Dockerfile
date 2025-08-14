# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_API_URL
ARG VITE_PUBLIC_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PUBLIC_URL=$VITE_PUBLIC_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install dumb-init
RUN apk add --no-cache dumb-init

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001

# Expose port
EXPOSE 80

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
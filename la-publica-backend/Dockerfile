FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY src ./src

# Build
RUN npm run build

# Crear directorio uploads
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 3000

# Usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Start
CMD ["npm", "start"]

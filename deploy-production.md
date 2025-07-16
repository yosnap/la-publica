# Guía de Despliegue en Producción - La Pública

## 🌐 Arquitectura Recomendada

- **Frontend**: `https://web.lapublica.cat` (Puerto 443/HTTPS)
- **API Backend**: `https://api.lapublica.cat` (Puerto 443/HTTPS)
- **Base de Datos**: MongoDB (Puerto 27017, no expuesto públicamente)

## 📋 Variables de Entorno

### Backend (API) - `https://api.lapublica.cat`

```bash
# Entorno
NODE_ENV=production

# Base de datos
MONGODB_URI=mongodb://localhost:27017/la-publica-prod

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key

# Puerto (internamente, reverse proxy maneja HTTPS)
PORT=5050

# Cloudinary (para imágenes)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Email (opcional)
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=noreply@lapublica.cat
EMAIL_PASS=your-email-password
```

### Frontend - `https://web.lapublica.cat`

```bash
# API del backend
VITE_API_URL=https://api.lapublica.cat

# URL pública para imágenes
VITE_PUBLIC_URL=https://web.lapublica.cat
```

## 🔧 Configuración del Servidor Web

### Nginx Configuration

```nginx
# Frontend - web.lapublica.cat
server {
    listen 443 ssl;
    server_name web.lapublica.cat;
    
    ssl_certificate /path/to/ssl/web.lapublica.cat.crt;
    ssl_certificate_key /path/to/ssl/web.lapublica.cat.key;
    
    root /path/to/la-publica-frontend/dist;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Caché para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# API Backend - api.lapublica.cat
server {
    listen 443 ssl;
    server_name api.lapublica.cat;
    
    ssl_certificate /path/to/ssl/api.lapublica.cat.crt;
    ssl_certificate_key /path/to/ssl/api.lapublica.cat.key;
    
    location / {
        proxy_pass http://localhost:5050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers (backup, aunque el backend ya los maneja)
        add_header Access-Control-Allow-Origin "https://web.lapublica.cat" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials "true" always;
    }
    
    # Handle preflight OPTIONS requests
    location ~ ^/(.*)$ {
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "https://web.lapublica.cat";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
            add_header Access-Control-Allow-Credentials "true";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 200;
        }
    }
}

# Redirecciones HTTP a HTTPS
server {
    listen 80;
    server_name web.lapublica.cat api.lapublica.cat;
    return 301 https://$server_name$request_uri;
}
```

## 🚀 Pasos de Despliegue

### 1. Preparar el Backend

```bash
# En el servidor de producción
cd /path/to/la-publica-backend

# Instalar dependencias
npm ci --production

# Compilar TypeScript
npm run build

# Crear archivo .env con las variables de arriba
nano .env

# Iniciar con PM2 (recomendado)
pm2 start ecosystem.config.js --env production
```

### 2. Preparar el Frontend

```bash
# En tu máquina local o servidor de build
cd la-publica-frontend

# Crear archivo .env.production
echo "VITE_API_URL=https://api.lapublica.cat" > .env.production
echo "VITE_PUBLIC_URL=https://web.lapublica.cat" >> .env.production

# Build para producción
npm run build

# Subir dist/ al servidor
rsync -avz dist/ user@server:/path/to/web/root/
```

### 3. Configurar PM2 (Backend)

Crear `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'la-publica-api',
      script: 'dist/server.js',
      cwd: '/path/to/la-publica-backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5050
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5050
      },
      error_file: '/var/log/pm2/la-publica-api-error.log',
      out_file: '/var/log/pm2/la-publica-api-out.log',
      log_file: '/var/log/pm2/la-publica-api.log',
      time: true
    }
  ]
};
```

## 🧪 Verificar Configuración

```bash
# Probar conectividad de la API
curl -I https://api.lapublica.cat/api/health

# Probar CORS
node scripts/test-cors.js https://api.lapublica.cat

# Verificar frontend
curl -I https://web.lapublica.cat
```

## 🔍 Troubleshooting CORS

### Problemas Comunes:

1. **Error**: `No 'Access-Control-Allow-Origin' header`
   - **Solución**: Verificar que `NODE_ENV=production` esté configurado en el backend

2. **Error**: `CORS blocked origin`
   - **Solución**: Revisar que `https://web.lapublica.cat` esté en la lista de orígenes permitidos

3. **Error**: `net::ERR_FAILED`
   - **Solución**: Verificar que el backend esté ejecutándose y sea accesible

### Debug CORS:

```bash
# Ver logs del backend
pm2 logs la-publica-api

# Probar manualmente
curl -H "Origin: https://web.lapublica.cat" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization" \
     -X OPTIONS \
     https://api.lapublica.cat/api/auth/register
```

## 📚 Comandos Útiles

```bash
# Reiniciar API
pm2 restart la-publica-api

# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs la-publica-api --lines 100

# Recargar configuración de Nginx
sudo nginx -t && sudo systemctl reload nginx

# Verificar certificados SSL
openssl s_client -connect api.lapublica.cat:443 -servername api.lapublica.cat
```
#!/bin/bash

# Script de setup inicial para VPS Hostinger
echo "🛠️  Configurando VPS para La Pública..."

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Crear usuario para la aplicación
sudo adduser --system --group lapublica

# Crear directorios
sudo mkdir -p /var/www/la-publica
sudo mkdir -p /var/www/la-publica/uploads
sudo mkdir -p /var/www/la-publica/logs
sudo mkdir -p /var/www/la-publica/backups

# Permisos
sudo chown -R lapublica:lapublica /var/www/la-publica

# Configurar firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Instalar Certbot para SSL
sudo apt install -y certbot python3-certbot-nginx

echo "✅ Setup inicial completado!"
echo "📝 Próximos pasos:"
echo "1. Configurar las variables de entorno"
echo "2. Clonar el repositorio en /var/www/la-publica"
echo "3. Configurar Nginx"
echo "4. Obtener certificado SSL con certbot"
echo "5. Ejecutar el script de deploy"

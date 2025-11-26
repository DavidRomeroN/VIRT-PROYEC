#!/bin/bash
# Script de configuración para EC2 Frontend

echo "Instalando Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

echo "Instalando Angular CLI..."
sudo npm install -g @angular/cli

echo "Instalando Nginx..."
sudo yum install nginx -y

echo "Configurando Nginx..."
sudo cat > /etc/nginx/conf.d/auditorio.conf << 'EOF'
server {
    listen 80;
    server_name _;

    root /var/www/auditorio-reserva;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo "Creando directorio web..."
sudo mkdir -p /var/www/auditorio-reserva
sudo chown -R ec2-user:ec2-user /var/www/auditorio-reserva

echo "Habilitando y iniciando Nginx..."
sudo systemctl enable nginx
sudo systemctl start nginx

echo "Configuración completada. Recuerda:"
echo "1. Clonar el repositorio en /var/www/auditorio-reserva"
echo "2. Ejecutar 'npm install'"
echo "3. Configurar la URL del backend en los servicios"
echo "4. Ejecutar 'ng build --configuration production'"
echo "5. Copiar los archivos de dist/ a /var/www/auditorio-reserva"






#!/bin/bash
# Script de configuración para EC2 Backend

echo "Instalando Java 17..."
sudo yum update -y
sudo yum install java-17-amazon-corretto -y

echo "Instalando Maven..."
sudo yum install maven -y

echo "Instalando MySQL Client..."
sudo yum install mysql -y

echo "Configurando variables de entorno..."
cat >> ~/.bashrc << EOF
export JAVA_HOME=/usr/lib/jvm/java-17-amazon-corretto
export PATH=\$PATH:\$JAVA_HOME/bin
export DB_HOST=TU_RDS_ENDPOINT
export DB_PORT=3306
export DB_NAME=auditorio_db
export DB_USER=admin
export DB_PASSWORD=TU_PASSWORD
export AWS_ACCESS_KEY=TU_ACCESS_KEY
export AWS_SECRET_KEY=TU_SECRET_KEY
export AWS_REGION=us-east-1
export S3_BUCKET_NAME=auditorio-universidad-media
export CLOUDFRONT_DOMAIN=TU_CLOUDFRONT_DOMAIN
export CORS_ORIGINS=https://TU_FRONTEND_DOMAIN
EOF

source ~/.bashrc

echo "Configuración completada. Reinicia la sesión o ejecuta 'source ~/.bashrc'"






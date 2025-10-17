#!/bin/bash

# Script para iniciar el backend con Docker

echo "🐳 Iniciando Clase de Surf Backend con Docker..."

# Verificar si existe .env
if [ ! -f .env ]; then
    echo "⚠️  No se encontró archivo .env"
    echo "📝 Copiando .env.docker.example a .env..."
    cp .env.docker.example .env
    echo "✅ Archivo .env creado. Por favor, edita las variables de entorno antes de continuar."
    exit 1
fi

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

# Construir imágenes
echo "🔨 Construyendo imágenes Docker..."
docker-compose build

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Ejecutar migraciones
echo "📦 Ejecutando migraciones de Prisma..."
docker-compose exec backend npx prisma migrate deploy

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
docker-compose exec backend npx prisma generate

# Mostrar logs
echo ""
echo "✅ Backend iniciado correctamente!"
echo ""
echo "📊 Servicios disponibles:"
echo "   - Backend API: http://localhost:4000"
echo "   - PostgreSQL: localhost:5432"
echo ""
echo "📝 Comandos útiles:"
echo "   - Ver logs: docker-compose logs -f backend"
echo "   - Detener: docker-compose down"
echo "   - Reiniciar: docker-compose restart backend"
echo "   - Ver estado: docker-compose ps"
echo ""
echo "🔍 Mostrando logs del backend..."
docker-compose logs -f backend

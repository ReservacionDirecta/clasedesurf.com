#!/bin/bash

# Script para resolver migración fallida en Railway
# Uso: ./fix-migration.sh

echo "🔧 Resolviendo migración fallida..."
echo ""

# Verificar estado actual
echo "📊 Estado actual de migraciones:"
npx prisma migrate status
echo ""

# Resolver la migración fallida
echo "✅ Marcando migración como resuelta..."
npx prisma migrate resolve --applied 20251201191207_add_avatar_field

# Verificar nuevamente
echo ""
echo "📊 Estado después de resolver:"
npx prisma migrate status
echo ""

# Desplegar migraciones pendientes
echo "🚀 Desplegando migraciones pendientes..."
npx prisma migrate deploy

# Generar cliente Prisma
echo ""
echo "🔨 Generando cliente Prisma..."
npx prisma generate

echo ""
echo "✅ ¡Migración resuelta exitosamente!"

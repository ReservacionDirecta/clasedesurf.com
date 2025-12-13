-- Script robusto para reparar el estado de notificaciones en Railway
-- Se puede ejecutar múltiples veces sin error (Idempotente)
DO $$ BEGIN -- 1. Crear el enum NotificationType si no existe
IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'NotificationType'
) THEN CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'WHATSAPP', 'SYSTEM');
RAISE NOTICE 'Enum NotificationType creado';
ELSE RAISE NOTICE 'Enum NotificationType ya existe';
END IF;
-- 2. Crear la tabla notifications si no existe
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
-- 3. Crear constraint de Foreign Key si no existe
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_userId_fkey'
        AND table_name = 'notifications'
) THEN
ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
RAISE NOTICE 'Foreign Key notifications_userId_fkey creada';
ELSE RAISE NOTICE 'Foreign Key notifications_userId_fkey ya existe';
END IF;
-- 4. INTENTO DE REPARACIÓN DE ESTADO DE MIGRACIÓN (Opcional/Avanzado)
-- Marca la migración fallida como exitosa si ya se aplicaron los cambios manualmente
-- NOTA: Esto asume que el nombre de la migración es exacto '20251213050700_add_notification_model'
UPDATE _prisma_migrations
SET finished_at = NOW(),
    logs = logs || 'Manual fix applied via SQL script',
    rolled_back_at = NULL
WHERE migration_name = '20251213050700_add_notification_model'
    AND finished_at IS NULL;
END $$;
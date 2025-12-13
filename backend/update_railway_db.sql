-- Script SQL seguro para actualizar la base de datos de Railway
-- Combina las últimas migraciones de forma idempotente (segura de ejecutar múltiples veces)
BEGIN;
-- 1. Agregar tabla discount_codes si no existe
CREATE TABLE IF NOT EXISTS "discount_codes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountPercentage" DOUBLE PRECISION NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "schoolId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);
-- Indices para discount_codes
CREATE UNIQUE INDEX IF NOT EXISTS "discount_codes_code_key" ON "discount_codes"("code");
-- 2. Actualizar tabla payments (Descuentos)
ALTER TABLE "payments"
ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION;
ALTER TABLE "payments"
ADD COLUMN IF NOT EXISTS "discountCodeId" INTEGER;
ALTER TABLE "payments"
ADD COLUMN IF NOT EXISTS "originalAmount" DOUBLE PRECISION;
-- Foreign Key para payments -> discount_codes
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'payments_discountCodeId_fkey'
) THEN
ALTER TABLE "payments"
ADD CONSTRAINT "payments_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "discount_codes"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
END IF;
END $$;
-- Foreign Key para discount_codes -> schools
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'discount_codes_schoolId_fkey'
) THEN
ALTER TABLE "discount_codes"
ADD CONSTRAINT "discount_codes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
END IF;
END $$;
-- 3. Actualizar tabla users (Avatar)
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "avatar" TEXT;
-- 4. Actualizar tabla schools y classes (Status y Soft Delete)
-- Enum SchoolStatus
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'SchoolStatus'
) THEN CREATE TYPE "SchoolStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
END IF;
END $$;
-- Columna deletedAt en classes
ALTER TABLE "classes"
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
-- Columna status en schools
ALTER TABLE "schools"
ADD COLUMN IF NOT EXISTS "status" "SchoolStatus" NOT NULL DEFAULT 'PENDING';
-- 5. REPARACIÓN DEL ESTADO DE MIGRACIÓN (Fix Error P3009)
-- Marcar la migración fallida como exitosa manualmente
UPDATE "_prisma_migrations"
SET "finished_at" = NOW(),
    "logs" = NULL,
    "rolled_back_at" = NULL
WHERE "migration_name" = '20251212031634_add_soft_delete_to_classes'
    AND "finished_at" IS NULL;
COMMIT;
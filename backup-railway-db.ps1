# Script de backup para base de datos Railway
param(
    [string]$BackupPath = "./backups",
    [switch]$Compress = $true,
    [switch]$Upload = $false,
    [string]$S3Bucket = "",
    [int]$RetentionDays = 30,
    [switch]$Scheduled = $false
)

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFileName = "clasedesurf_backup_$timestamp.sql"
$backupFilePath = Join-Path $BackupPath $backupFileName

Write-Host "💾 Backup de Base de Datos Railway" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor White

# Verificar Railway CLI
try {
    railway --version | Out-Null
    Write-Host "✅ Railway CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI no encontrado. Instálalo con: npm install -g @railway/cli" -ForegroundColor Red
    exit 1
}

# Verificar autenticación
Write-Host "🔐 Verificando autenticación..." -ForegroundColor Yellow
railway whoami | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ No estás logueado en Railway. Ejecuta: railway login" -ForegroundColor Red
    exit 1
}

# Crear directorio de backups si no existe
if (-not (Test-Path $BackupPath)) {
    Write-Host "📁 Creando directorio de backups: $BackupPath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
}

Write-Host "📊 Información del backup:" -ForegroundColor Cyan
Write-Host "Archivo: $backupFileName" -ForegroundColor White
Write-Host "Ruta: $backupFilePath" -ForegroundColor White
Write-Host "Compresión: $(if ($Compress) { 'Sí' } else { 'No' })" -ForegroundColor White

# Obtener información de la base de datos
Write-Host "" -ForegroundColor White
Write-Host "🔍 Obteniendo información de la base de datos..." -ForegroundColor Yellow

try {
    # Obtener la URL de la base de datos
    $dbInfo = railway variables get DATABASE_URL 2>$null
    
    if (-not $dbInfo) {
        Write-Host "❌ No se pudo obtener la URL de la base de datos" -ForegroundColor Red
        Write-Host "💡 Asegúrate de estar en el directorio correcto del proyecto" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ Información de base de datos obtenida" -ForegroundColor Green
} catch {
    Write-Host "❌ Error obteniendo información de la base de datos: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Realizar backup
Write-Host "" -ForegroundColor White
Write-Host "💾 Realizando backup..." -ForegroundColor Yellow

try {
    # Usar railway run para ejecutar pg_dump
    $pgDumpCommand = "pg_dump `$DATABASE_URL --no-owner --no-privileges --clean --if-exists"
    
    Write-Host "Ejecutando: railway run $pgDumpCommand" -ForegroundColor Gray
    
    # Ejecutar el comando y guardar la salida
    $backupContent = railway run $pgDumpCommand
    
    if ($LASTEXITCODE -eq 0) {
        # Guardar el backup
        $backupContent | Out-File -FilePath $backupFilePath -Encoding UTF8
        
        $fileSize = (Get-Item $backupFilePath).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        
        Write-Host "✅ Backup completado exitosamente" -ForegroundColor Green
        Write-Host "📊 Tamaño del archivo: $fileSizeMB MB" -ForegroundColor White
    } else {
        Write-Host "❌ Error durante el backup" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error realizando backup: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Comprimir backup si se solicita
if ($Compress) {
    Write-Host "" -ForegroundColor White
    Write-Host "🗜️  Comprimiendo backup..." -ForegroundColor Yellow
    
    try {
        $compressedPath = "$backupFilePath.gz"
        
        # Usar gzip si está disponible, sino usar Compress-Archive
        if (Get-Command gzip -ErrorAction SilentlyContinue) {
            gzip $backupFilePath
            $finalPath = $compressedPath
        } else {
            $zipPath = "$backupFilePath.zip"
            Compress-Archive -Path $backupFilePath -DestinationPath $zipPath
            Remove-Item $backupFilePath
            $finalPath = $zipPath
        }
        
        $compressedSize = (Get-Item $finalPath).Length
        $compressedSizeMB = [math]::Round($compressedSize / 1MB, 2)
        $compressionRatio = [math]::Round((1 - ($compressedSize / $fileSize)) * 100, 1)
        
        Write-Host "✅ Compresión completada" -ForegroundColor Green
        Write-Host "📊 Tamaño comprimido: $compressedSizeMB MB (reducción: $compressionRatio%)" -ForegroundColor White
        
        $backupFilePath = $finalPath
    } catch {
        Write-Host "⚠️  Error comprimiendo archivo: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "💡 Continuando con archivo sin comprimir" -ForegroundColor Gray
    }
}

# Subir a S3 si se solicita
if ($Upload -and $S3Bucket) {
    Write-Host "" -ForegroundColor White
    Write-Host "☁️  Subiendo a S3..." -ForegroundColor Yellow
    
    try {
        # Verificar AWS CLI
        aws --version | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            $s3Key = "backups/clasedesurf/$(Split-Path $backupFilePath -Leaf)"
            aws s3 cp $backupFilePath "s3://$S3Bucket/$s3Key"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Backup subido a S3: s3://$S3Bucket/$s3Key" -ForegroundColor Green
            } else {
                Write-Host "❌ Error subiendo a S3" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠️  AWS CLI no encontrado, saltando subida a S3" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Error subiendo a S3: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Limpiar backups antiguos
Write-Host "" -ForegroundColor White
Write-Host "🧹 Limpiando backups antiguos..." -ForegroundColor Yellow

try {
    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    $oldBackups = Get-ChildItem -Path $BackupPath -Filter "clasedesurf_backup_*" | Where-Object { $_.CreationTime -lt $cutoffDate }
    
    if ($oldBackups.Count -gt 0) {
        Write-Host "🗑️  Eliminando $($oldBackups.Count) backup(s) antiguos..." -ForegroundColor Gray
        $oldBackups | Remove-Item -Force
        Write-Host "✅ Limpieza completada" -ForegroundColor Green
    } else {
        Write-Host "✅ No hay backups antiguos para eliminar" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Error durante la limpieza: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Verificar integridad del backup
Write-Host "" -ForegroundColor White
Write-Host "🔍 Verificando integridad del backup..." -ForegroundColor Yellow

try {
    if (Test-Path $backupFilePath) {
        $finalSize = (Get-Item $backupFilePath).Length
        
        if ($finalSize -gt 0) {
            Write-Host "✅ Backup verificado correctamente" -ForegroundColor Green
        } else {
            Write-Host "❌ El archivo de backup está vacío" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ El archivo de backup no existe" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error verificando backup: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Resumen final
Write-Host "" -ForegroundColor White
Write-Host "🎉 Backup completado exitosamente!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor White
Write-Host "📁 Archivo: $backupFilePath" -ForegroundColor White
Write-Host "📊 Tamaño: $([math]::Round((Get-Item $backupFilePath).Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host "🕒 Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White

if ($Upload -and $S3Bucket) {
    Write-Host "☁️  S3: s3://$S3Bucket/backups/clasedesurf/" -ForegroundColor White
}

Write-Host "" -ForegroundColor White
Write-Host "💡 Para restaurar este backup:" -ForegroundColor Cyan
Write-Host "railway run psql `$DATABASE_URL < $backupFilePath" -ForegroundColor Gray

# Si es un backup programado, registrar en log
if ($Scheduled) {
    $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Backup completado: $backupFilePath"
    $logPath = Join-Path $BackupPath "backup.log"
    Add-Content -Path $logPath -Value $logEntry
}

Write-Host "" -ForegroundColor White
Write-Host "🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "Backup manual:     ./backup-railway-db.ps1" -ForegroundColor White
Write-Host "Backup comprimido: ./backup-railway-db.ps1 -Compress" -ForegroundColor White
Write-Host "Backup a S3:       ./backup-railway-db.ps1 -Upload -S3Bucket 'mi-bucket'" -ForegroundColor White
Write-Host "Programar backup:  ./backup-railway-db.ps1 -Scheduled" -ForegroundColor White
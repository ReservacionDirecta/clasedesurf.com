# Script para usar npx en lugar de npm cuando npm.ps1 está corrupto
# Guarda este archivo como npm-fix.ps1 y úsalo cuando npm falle

param(
    [Parameter(Position=0)]
    [string]$Command,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

switch ($Command) {
    "run" {
        $script = $Arguments[0]
        $restArgs = $Arguments[1..($Arguments.Length-1)]
        
        # Leer package.json para obtener el comando
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        $scriptCommand = $packageJson.scripts.$script
        
        if ($scriptCommand) {
            Write-Host "Ejecutando: $scriptCommand" -ForegroundColor Green
            Invoke-Expression $scriptCommand
        } else {
            Write-Host "Script '$script' no encontrado en package.json" -ForegroundColor Red
        }
    }
    "install" {
        Write-Host "Ejecutando: npm install usando node directamente" -ForegroundColor Green
        node (Get-Command npm).Source install @Arguments
    }
    "build" {
        Write-Host "Ejecutando: npx next build" -ForegroundColor Green
        npx next build
    }
    default {
        Write-Host "Ejecutando: npm $Command $Arguments" -ForegroundColor Green
        node (Get-Command npm).Source $Command @Arguments
    }
}

# PowerShell script to generate Prisma client and run migrations (development)
# Usage: Open PowerShell in the backend folder and run: .\scripts\setup-db.ps1

Write-Output "Running Prisma generate..."
npx prisma generate

Write-Output "Running Prisma migrate dev..."
npx prisma migrate dev --name init --preview-feature

Write-Output "Done."

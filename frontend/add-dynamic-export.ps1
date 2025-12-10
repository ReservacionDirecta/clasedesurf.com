# Script para agregar export const dynamic = 'force-dynamic' a todas las páginas del dashboard

$files = @(
    "src/app/dashboard/admin/classes/page.tsx",
    "src/app/dashboard/admin/overview/page.tsx",
    "src/app/dashboard/admin/reservations/page.tsx",
    "src/app/dashboard/admin/payments/page.tsx",
    "src/app/dashboard/admin/users/page.tsx",
    "src/app/dashboard/admin/reports/page.tsx",
    "src/app/dashboard/admin/account/page.tsx",
    "src/app/dashboard/admin/profile/page.tsx",
    "src/app/dashboard/admin/settings/page.tsx",
    "src/app/dashboard/admin/schools/page.tsx",
    "src/app/dashboard/admin/logs/page.tsx",
    "src/app/dashboard/school/classes/page.tsx",
    "src/app/dashboard/school/classes/new/page.tsx",
    "src/app/dashboard/school/reservations/page.tsx",
    "src/app/dashboard/school/payments/page.tsx",
    "src/app/dashboard/school/students/page.tsx",
    "src/app/dashboard/school/instructors/page.tsx",
    "src/app/dashboard/school/profile/page.tsx",
    "src/app/dashboard/school/settings/page.tsx",
    "src/app/dashboard/school/calendar/page.tsx",
    "src/app/dashboard/instructor/classes/page.tsx",
    "src/app/dashboard/instructor/students/page.tsx",
    "src/app/dashboard/instructor/earnings/page.tsx",
    "src/app/dashboard/instructor/profile/page.tsx",
    "src/app/dashboard/student/profile/page.tsx",
    "src/app/dashboard/student/reservations/page.tsx",
    "src/app/dashboard/head-coach/page.tsx",
    "src/app/dashboard/head-coach/calendar/page.tsx",
    "src/app/denied/page.tsx",
    "src/app/debug-session/page.tsx",
    "src/app/test-admin-login/page.tsx",
    "src/app/test-all-users/page.tsx",
    "src/app/clear-session/page.tsx"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        if ($content -notmatch "export const dynamic") {
            if ($content -match "^'use client'|^""use client""") {
                $content = $content -replace "('use client'|""use client"");?\s*\n", "`$1`n`nexport const dynamic = 'force-dynamic';`n"
            } elseif ($content -match "^import ") {
                $content = "export const dynamic = 'force-dynamic';`n`n" + $content
            }
            Set-Content -Path $fullPath -Value $content -NoNewline
            Write-Host "Updated: $file"
        } else {
            Write-Host "Skipped (already has dynamic): $file"
        }
    } else {
        Write-Host "Not found: $file"
    }
}

Write-Host "Done!"











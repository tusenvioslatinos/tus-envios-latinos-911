# Clean Expo and Node cache script for Windows PowerShell

Write-Host "🧹 Cleaning caches..." -ForegroundColor Green

# Remove .expo folder if exists
if (Test-Path "$env:USERPROFILE\.expo") {
    Write-Host "Removing .expo folder..." -ForegroundColor Yellow
    Remove-Item -Path "$env:USERPROFILE\.expo" -Recurse -Force -ErrorAction SilentlyContinue
}

# Remove local .expo folder if exists
if (Test-Path ".expo") {
    Write-Host "Removing local .expo folder..." -ForegroundColor Yellow
    Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
}

# Remove Metro cache
if (Test-Path ".metro") {
    Write-Host "Removing Metro cache..." -ForegroundColor Yellow
    Remove-Item -Path ".metro" -Recurse -Force -ErrorAction SilentlyContinue
}

# Remove Metro cache from temp directory
$metroCachePath = "$env:TEMP\metro-*"
if (Test-Path $metroCachePath) {
    Write-Host "Removing Metro temp cache..." -ForegroundColor Yellow
    Remove-Item -Path $metroCachePath -Recurse -Force -ErrorAction SilentlyContinue
}

# Remove node_modules (comentado por defecto, descomenta si necesitas)
# if (Test-Path "node_modules") {
#     Write-Host "Removing node_modules..." -ForegroundColor Yellow
#     Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
# }

# Clear bun cache
Write-Host "Clearing bun cache..." -ForegroundColor Yellow
& bun pm cache rm 2>$null

Write-Host "✅ Cache cleaned successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. bun run start:lan:clear  (to start with clean cache)" -ForegroundColor White
Write-Host "  2. Or just: bun run start:lan" -ForegroundColor White

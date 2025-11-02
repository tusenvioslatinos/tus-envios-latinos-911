# Clean Expo and Node cache script for Windows PowerShell

Write-Host "Cleaning caches..." -ForegroundColor Green

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

# Remove node_modules
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}

# Clear bun cache
Write-Host "Clearing bun cache..." -ForegroundColor Yellow
& bun pm cache rm

Write-Host "Cache cleaned successfully!" -ForegroundColor Green
Write-Host "Now run: bun install" -ForegroundColor Cyan

# Script para preparar las credenciales de Firebase para Railway

$firebaseJsonPath = "tus-envios-latinos-c9d53-firebase-adminsdk-fbsvc-a4d6cbcf0c.json"

Write-Host "🔧 Preparando credenciales de Firebase para Railway..." -ForegroundColor Cyan

if (-not (Test-Path $firebaseJsonPath)) {
    Write-Host "❌ Error: No se encontró el archivo $firebaseJsonPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivo encontrado" -ForegroundColor Green

# Leer y convertir a una sola línea
$jsonContent = Get-Content $firebaseJsonPath -Raw
$jsonOneLine = ($jsonContent | ConvertFrom-Json | ConvertTo-Json -Compress)

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "COPIA ESTE JSON (aparece abajo) para pegarlo en Railway:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""
Write-Host $jsonOneLine -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 INSTRUCCIONES PARA RAILWAY:" -ForegroundColor Cyan
Write-Host "   1. Ve a tu proyecto en Railway" -ForegroundColor White
Write-Host "   2. Haz clic en 'Variables'" -ForegroundColor White
Write-Host "   3. Haz clic en '+ New Variable'" -ForegroundColor White
Write-Host "   4. Nombre: FIREBASE_SERVICE_ACCOUNT_KEY" -ForegroundColor White
Write-Host "   5. Valor: Copia y pega el JSON de arriba" -ForegroundColor White
Write-Host "   6. Guarda" -ForegroundColor White
Write-Host ""
Write-Host "✅ Listo!" -ForegroundColor Green

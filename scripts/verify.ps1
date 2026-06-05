# ==========================================
# KADHAISOLAI RUNTIME VERIFICATION
# ==========================================

Write-Host ""
Write-Host "=== STEP 1 : DOCKER STATUS ===" -ForegroundColor Green
docker ps

Write-Host ""
Write-Host "=== STEP 2 : SUPABASE STATUS ===" -ForegroundColor Green
npx supabase status

Write-Host ""
Write-Host "=== STEP 3 : DATABASE VALIDATION ===" -ForegroundColor Green
if ((Get-Content package.json -Raw) -match '"validate"') {
    npm run validate
} else {
    Write-Host "No validate script found."
}

Write-Host ""
Write-Host "=== STEP 4 : GOLDEN PIPELINE ===" -ForegroundColor Green
if ((Get-Content package.json -Raw) -match '"golden"') {
    npm run golden
} else {
    Write-Host "No golden script found."
}

Write-Host ""
Write-Host "=== STEP 5 : START NEXT.JS ===" -ForegroundColor Green
npm run dev

Write-Host ""
Write-Host "======================================"
Write-Host "VERIFICATION COMPLETE"
Write-Host "======================================"

Write-Host ""
Write-Host "Check:"
Write-Host "http://localhost:3000"
Write-Host "http://127.0.0.1:54323"

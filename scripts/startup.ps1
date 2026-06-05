# ==========================================
# KADHAISOLAI INFRASTRUCTURE STARTUP + VERIFY
# ==========================================

Write-Host ""
Write-Host "=== KADHAISOLAI STARTUP ===" -ForegroundColor Green

# Verify Node
Write-Host "`n[1/8] Checking Node..."
node -v
npm -v

# Verify Docker
Write-Host "`n[2/8] Checking Docker..."
docker --version
docker ps

# Clean old build artifacts
Write-Host "`n[3/8] Cleaning workspace..."
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force coverage -ErrorAction SilentlyContinue

# Install dependencies
Write-Host "`n[4/8] Installing dependencies..."
npm install

# Initialize Supabase if needed
if (!(Test-Path "supabase\config.toml")) {
    Write-Host "`nInitializing Supabase..."
    npx supabase init
}

# Start Supabase Local Stack
Write-Host "`n[5/8] Starting Supabase..."
npx supabase start

# Show Supabase status
Write-Host "`n[6/8] Verifying Supabase..."
npx supabase status

# Run migrations if script exists
if ((Get-Content package.json -Raw) -match '"migrate"') {
    Write-Host "`nRunning migrations..."
    npm run migrate
}

# Run validation if script exists
if ((Get-Content package.json -Raw) -match '"validate"') {
    Write-Host "`nRunning validation..."
    npm run validate
}

# Start worker if script exists
if ((Get-Content package.json -Raw) -match '"worker"') {
    Write-Host "`nStarting BullMQ worker..."
    Start-Process powershell -ArgumentList "cd '$PWD'; npm run worker"
}

# Run Golden Pipeline if script exists
if ((Get-Content package.json -Raw) -match '"golden"') {
    Write-Host "`nRunning Golden Pipeline..."
    npm run golden
}

# Start Next.js
Write-Host "`n[8/8] Starting Next.js..."
npm run dev

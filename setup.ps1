# WonderTech Setup Script (PowerShell)
Write-Host "🚀 Starting WonderTech Application Setup..." -ForegroundColor Cyan

# Check Node.js installation
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js v18 or higher." -ForegroundColor Red
    exit 1
}

# Check npm installation
try {
    $npmVersion = npm -v
    Write-Host "✅ npm $npmVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm." -ForegroundColor Red
    exit 1
}

# Install root dependencies
Write-Host ""
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

# Install backend dependencies
Write-Host ""
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Install frontend dependencies
Write-Host ""
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Create backend .env file if it doesn't exist
if (-not (Test-Path "backend\.env")) {
    Write-Host ""
    Write-Host "⚙️  Creating backend\.env file..." -ForegroundColor Yellow
    
    $backendEnvContent = @"
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=wondertech_db

# JWT Configuration
JWT_SECRET=wondertech-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173
"@
    
    Set-Content -Path "backend\.env" -Value $backendEnvContent
    Write-Host "✅ Created backend\.env file (please update DB_PASSWORD)" -ForegroundColor Green
} else {
    Write-Host "⚠️  backend\.env already exists, skipping creation" -ForegroundColor Yellow
}

# Create frontend .env file if it doesn't exist
if (-not (Test-Path "frontend\.env")) {
    Write-Host ""
    Write-Host "⚙️  Creating frontend\.env file..." -ForegroundColor Yellow
    
    $frontendEnvContent = @"
# Backend API URL (optional - uses proxy by default)
# VITE_API_URL=http://localhost:5000/api

# Application Configuration
VITE_APP_NAME=WonderTech
VITE_APP_VERSION=1.0.0
"@
    
    Set-Content -Path "frontend\.env" -Value $frontendEnvContent
    Write-Host "✅ Created frontend\.env file" -ForegroundColor Green
} else {
    Write-Host "⚠️  frontend\.env already exists, skipping creation" -ForegroundColor Yellow
}

# Create uploads directory
Write-Host ""
Write-Host "📁 Creating uploads directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "backend\uploads" | Out-Null
Write-Host "✅ Uploads directory created" -ForegroundColor Green

Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update backend\.env with your MySQL credentials"
Write-Host "2. Create MySQL database: CREATE DATABASE wondertech_db;"
Write-Host "3. Run: npm run dev"
Write-Host ""
Write-Host "The application will be available at:" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:5173"
Write-Host "  - Backend:  http://localhost:5000"
Write-Host ""


#!/bin/bash

# WonderTech Setup Script
echo "🚀 Starting WonderTech Application Setup..."

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check npm installation
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ npm $(npm -v) detected"

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create backend .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo ""
    echo "⚙️  Creating backend/.env file..."
    cat > backend/.env << 'EOF'
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
EOF
    echo "✅ Created backend/.env file (please update DB_PASSWORD)"
else
    echo "⚠️  backend/.env already exists, skipping creation"
fi

# Create frontend .env file if it doesn't exist
if [ ! -f frontend/.env ]; then
    echo ""
    echo "⚙️  Creating frontend/.env file..."
    cat > frontend/.env << 'EOF'
# Backend API URL (optional - uses proxy by default)
# VITE_API_URL=http://localhost:5000/api

# Application Configuration
VITE_APP_NAME=WonderTech
VITE_APP_VERSION=1.0.0
EOF
    echo "✅ Created frontend/.env file"
else
    echo "⚠️  frontend/.env already exists, skipping creation"
fi

# Create uploads directory
echo ""
echo "📁 Creating uploads directory..."
mkdir -p backend/uploads
echo "✅ Uploads directory created"

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your MySQL credentials"
echo "2. Create MySQL database: CREATE DATABASE wondertech_db;"
echo "3. Run: npm run dev"
echo ""
echo "The application will be available at:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend:  http://localhost:5000"
echo ""


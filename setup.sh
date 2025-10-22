#!/bin/bash

# Abstract Battle Arena Setup Script
echo "🎮 Setting up Abstract Battle Arena..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"

# Create environment files
echo "⚙️  Creating environment files..."
cd ../backend
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created backend/.env (please update with your values)"
else
    echo "ℹ️  backend/.env already exists"
fi

cd ../frontend
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created frontend/.env (please update with your values)"
else
    echo "ℹ️  frontend/.env already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your MongoDB URI and JWT secret"
echo "2. Update frontend/.env with your API URL and contract address"
echo "3. Start the backend: cd backend && npm run dev"
echo "4. Start the frontend: cd frontend && npm start"
echo ""
echo "🚀 Ready to battle!"

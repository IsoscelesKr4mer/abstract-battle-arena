@echo off
echo 🎮 Setting up Abstract Battle Arena...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

REM Create environment files
echo ⚙️  Creating environment files...
cd ..\backend
if not exist .env (
    copy env.example .env
    echo ✅ Created backend\.env (please update with your values)
) else (
    echo ℹ️  backend\.env already exists
)

cd ..\frontend
if not exist .env (
    copy env.example .env
    echo ✅ Created frontend\.env (please update with your values)
) else (
    echo ℹ️  frontend\.env already exists
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Update backend\.env with your MongoDB URI and JWT secret
echo 2. Update frontend\.env with your API URL and contract address
echo 3. Start the backend: cd backend ^&^& npm run dev
echo 4. Start the frontend: cd frontend ^&^& npm start
echo.
echo 🚀 Ready to battle!
pause

@echo off
echo ========================================
echo Abstract Battle Arena - Development Setup
echo ========================================
echo.

echo [1/6] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependency installation failed
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

echo.
echo [2/6] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

echo.
echo [3/6] Installing smart contract dependencies...
cd ..\contracts
call npm install
if %errorlevel% neq 0 (
    echo ❌ Smart contract dependency installation failed
    pause
    exit /b 1
)
echo ✅ Smart contract dependencies installed

echo.
echo [4/6] Compiling smart contracts...
call npx hardhat compile
if %errorlevel% neq 0 (
    echo ❌ Smart contract compilation failed
    pause
    exit /b 1
)
echo ✅ Smart contracts compiled

echo.
echo [5/6] Setting up environment files...
cd ..\backend
if not exist .env (
    copy env.example .env
    echo ✅ Backend .env file created from template
) else (
    echo ℹ️  Backend .env file already exists
)

cd ..\frontend
if not exist .env (
    copy env.example .env
    echo ✅ Frontend .env file created from template
) else (
    echo ℹ️  Frontend .env file already exists
)

echo.
echo [6/6] Setup complete! 
echo.
echo 🎮 Abstract Battle Arena is ready for development!
echo.
echo 📋 Next Steps:
echo    1. Update .env files with your configuration
echo    2. Start MongoDB (if using local instance)
echo    3. Run: npm run dev (in backend directory)
echo    4. Run: npm start (in frontend directory)
echo.
echo 🚀 Quick Start Commands:
echo    Backend:  cd backend ^&^& npm run dev
echo    Frontend: cd frontend ^&^& npm start
echo    Contracts: cd contracts ^&^& npx hardhat test
echo.
pause

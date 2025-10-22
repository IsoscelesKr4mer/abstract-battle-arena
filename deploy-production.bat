@echo off
echo ========================================
echo Abstract Battle Arena - Production Deployment
echo ========================================
echo.

echo [1/6] Installing backend dependencies...
cd backend
call npm install --production
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
echo [3/6] Building frontend for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend built successfully

echo.
echo [4/6] Installing smart contract dependencies...
cd ..\contracts
call npm install
if %errorlevel% neq 0 (
    echo ❌ Smart contract dependency installation failed
    pause
    exit /b 1
)
echo ✅ Smart contract dependencies installed

echo.
echo [5/6] Compiling smart contracts...
call npx hardhat compile
if %errorlevel% neq 0 (
    echo ❌ Smart contract compilation failed
    pause
    exit /b 1
)
echo ✅ Smart contracts compiled

echo.
echo [6/6] Production build complete!
echo.
echo 🚀 Ready for deployment!
echo.
echo 📋 Next Steps:
echo    1. Deploy backend to Railway:
echo       - Connect GitHub repository
echo       - Set environment variables
echo       - Deploy
echo.
echo    2. Deploy frontend to Vercel:
echo       - Connect GitHub repository
echo       - Set environment variables
echo       - Deploy
echo.
echo    3. Deploy smart contracts to Abstract Network:
echo       - Update hardhat.config.js with network settings
echo       - Run: npx hardhat run scripts/deploy.js --network abstract
echo.
echo 📝 Environment Variables Needed:
echo    Backend (Railway):
echo    - MONGODB_URI=your-mongodb-atlas-uri
echo    - JWT_SECRET=your-super-secure-jwt-secret
echo    - FRONTEND_URL=https://your-frontend-domain.vercel.app
echo    - NODE_ENV=production
echo.
echo    Frontend (Vercel):
echo    - REACT_APP_API_URL=https://your-backend-url.railway.app/api
echo    - REACT_APP_CONTRACT_ADDRESS=0xYourDeployedContractAddress
echo    - REACT_APP_NETWORK_ID=1
echo    - REACT_APP_AGW_ENABLED=true
echo.
echo 🎮 Your Abstract Battle Arena is ready for production deployment!
echo.
pause

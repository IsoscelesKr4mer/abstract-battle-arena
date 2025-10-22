# Abstract Battle Arena - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (or local MongoDB)
- Railway account for backend deployment
- Vercel account for frontend deployment

### Local Development Setup

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd abstract-battle-arena
   
   # Run setup script
   ./setup.sh  # Linux/Mac
   # or
   setup.bat   # Windows
   ```

2. **Configure Environment**
   - Update `backend/.env` with your MongoDB URI and JWT secret
   - Update `frontend/.env` with your API URL

3. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## 🌐 Production Deployment

### Backend Deployment (Railway)

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Create new project from GitHub repo
   - Select `abstract-battle-arena` repository

2. **Configure Service**
   - Railway will auto-detect Node.js project
   - Set root directory to `backend`
   - Add environment variables:
     ```
     PORT=5000
     MONGODB_URI=your-mongodb-atlas-uri
     JWT_SECRET=your-super-secure-jwt-secret
     FRONTEND_URL=https://your-frontend-domain.vercel.app
     NODE_ENV=production
     ```

3. **Deploy**
   - Railway will automatically build and deploy
   - Get your backend URL (e.g., `https://abstract-battle-arena-production.up.railway.app`)

### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import project from GitHub
   - Select `abstract-battle-arena` repository

2. **Configure Build Settings**
   - Framework Preset: `Create React App`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   REACT_APP_CONTRACT_ADDRESS=0xYourDeployedContractAddress
   REACT_APP_NETWORK_ID=1
   ```

4. **Deploy**
   - Vercel will automatically build and deploy
   - Get your frontend URL (e.g., `https://abstract-battle-arena.vercel.app`)

### Smart Contract Deployment

1. **Deploy to Abstract Network**
   ```bash
   # Install Hardhat
   npm install --save-dev hardhat
   
   # Deploy contract
   npx hardhat run scripts/deploy.js --network abstract
   ```

2. **Update Frontend**
   - Copy deployed contract address
   - Update `REACT_APP_CONTRACT_ADDRESS` in Vercel

## 🔧 Configuration

### MongoDB Atlas Setup

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create new cluster
   - Choose free tier (M0)

2. **Configure Access**
   - Add IP address (0.0.0.0/0 for Railway)
   - Create database user
   - Get connection string

3. **Update Backend**
   - Replace `<username>` and `<password>` in connection string
   - URL encode special characters in password

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/abstract-battle-arena
JWT_SECRET=your-super-secure-jwt-secret-key-here
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

#### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_CONTRACT_ADDRESS=0xYourDeployedContractAddress
REACT_APP_NETWORK_ID=1
```

## 🧪 Testing

### Local Testing
1. Start both backend and frontend
2. Open `http://localhost:3000`
3. Test wallet connection (mock implementation)
4. Test duel creation and joining
5. Test move commitment and revelation

### Production Testing
1. Deploy to Railway and Vercel
2. Test with real wallet connection
3. Test smart contract interactions
4. Verify all API endpoints work

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` is set correctly in backend
   - Check that frontend URL matches exactly

2. **MongoDB Connection Issues**
   - Verify connection string format
   - Check IP whitelist in MongoDB Atlas
   - Ensure password is URL encoded

3. **Build Failures**
   - Check Node.js version (16+ required)
   - Clear `node_modules` and reinstall
   - Check for TypeScript errors

4. **Smart Contract Issues**
   - Verify contract address is correct
   - Check network configuration
   - Ensure contract is deployed and verified

### Debug Commands

```bash
# Check backend logs
railway logs

# Check frontend build
vercel logs

# Test API endpoints
curl https://your-backend-url.railway.app/health
```

## 📊 Monitoring

### Health Checks
- Backend: `https://your-backend-url.railway.app/health`
- Frontend: Check Vercel deployment status

### Analytics
- Railway provides basic metrics
- Vercel provides build and performance metrics
- Consider adding Sentry for error tracking

## 🔄 Updates

### Updating Backend
1. Push changes to GitHub
2. Railway will auto-deploy
3. Check logs for any issues

### Updating Frontend
1. Push changes to GitHub
2. Vercel will auto-deploy
3. Check build logs

### Updating Smart Contract
1. Deploy new contract version
2. Update `REACT_APP_CONTRACT_ADDRESS`
3. Redeploy frontend

---

**🎮 Your Abstract Battle Arena is now live and ready for epic battles!**

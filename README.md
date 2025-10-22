# Abstract Battle Arena

A Gigaverse-inspired 1v1 PvP combat game built on blockchain technology. Players can create duels, stake ETH, and battle using a rock-paper-scissors style combat system with Sword, Shield, and Magic moves.

## 🎮 Features

- **Blockchain-based PvP Combat**: Secure, transparent battles using smart contracts
- **Stake Management**: Players can stake ETH on duels with automatic reward distribution
- **Move Commitment System**: Cryptographic move commitment prevents cheating
- **User Profiles**: Track stats, battle history, and achievements
- **Leaderboards**: Compete with other players globally
- **Responsive UI**: Modern, mobile-friendly interface

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Web3 Integration**: Web3.js for blockchain interactions
- **UI Components**: Lucide React icons, Chart.js for statistics

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with wallet signature verification
- **API**: RESTful API with comprehensive error handling
- **Security**: Helmet, CORS, rate limiting, input validation

### Smart Contracts (Solidity)
- **Language**: Solidity ^0.8.19
- **Framework**: Hardhat
- **Security**: OpenZeppelin contracts (ReentrancyGuard, Pausable, Ownable)
- **Features**: Move commitment/revelation, automatic reward distribution

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd abstract-battle-arena
   ```

2. **Run the setup script**
   ```bash
   # Windows
   setup-dev.bat
   
   # Linux/Mac
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Configure environment variables**
   - Update `backend/.env` with your MongoDB URI and JWT secret
   - Update `frontend/.env` with your API URL and contract address

4. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   
   # Terminal 3 - Smart Contracts (optional)
   cd contracts
   npx hardhat node
   ```

## 🎯 Game Mechanics

### Combat System
- **Sword** beats **Magic**
- **Magic** beats **Shield**  
- **Shield** beats **Sword**
- Ties result in no winner for that round

### Duel Process
1. **Create Duel**: Player sets stake amount and number of rounds
2. **Join Duel**: Another player joins with matching stake
3. **Commit Phase**: Both players commit to moves (hashed)
4. **Reveal Phase**: Both players reveal moves and round winner determined
5. **Repeat**: Process continues until one player wins majority of rounds
6. **Reward Distribution**: Winner receives stake minus platform fee

### Move Commitment
- Players hash their move + random salt before revealing
- Prevents cheating by ensuring moves are committed before revelation
- Uses SHA-256 hashing for security

## 📁 Project Structure

```
abstract-battle-arena/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Custom middleware
│   │   └── server.js       # Main server file
│   ├── package.json
│   └── .env               # Environment variables
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   ├── package.json
│   └── .env               # Environment variables
├── contracts/              # Smart contracts
│   ├── contracts/         # Solidity contracts
│   ├── scripts/           # Deployment scripts
│   ├── test/              # Contract tests
│   └── hardhat.config.js  # Hardhat configuration
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/authenticate` - Authenticate with wallet signature
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/refresh` - Refresh JWT token

### PvP Combat
- `POST /api/pvp/create` - Create new duel
- `POST /api/pvp/join/:duelId` - Join existing duel
- `GET /api/pvp/active` - Get active duels
- `POST /api/pvp/:duelId/commit` - Commit move
- `POST /api/pvp/:duelId/reveal` - Reveal move

### User Management
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/battle-history` - Get battle history
- `GET /api/users/profile/:address` - Get public profile

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Smart Contract Tests
```bash
cd contracts
npx hardhat test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deployment
- **Backend**: Deploy to Railway
- **Frontend**: Deploy to Vercel
- **Smart Contracts**: Deploy to Abstract Network
- **Database**: Use MongoDB Atlas

## 🔒 Security Features

- **Wallet Signature Verification**: Ensures only wallet owners can authenticate
- **Move Commitment**: Cryptographic commitment prevents move manipulation
- **Reentrancy Protection**: Prevents reentrancy attacks on smart contracts
- **Rate Limiting**: API rate limiting prevents abuse
- **Input Validation**: Comprehensive input validation on all endpoints
- **CORS Protection**: Proper CORS configuration for security

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Modern dark theme with purple/blue gradient
- **Real-time Updates**: Live battle status and statistics
- **Intuitive Interface**: Easy-to-use combat interface
- **Statistics Dashboard**: Comprehensive player statistics and charts
- **Leaderboards**: Global and filtered leaderboards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Join our Discord community (link coming soon)

## 🙏 Acknowledgments

- Inspired by the Gigaverse ecosystem
- Built with modern web3 technologies
- Thanks to the OpenZeppelin team for security contracts
- Thanks to the React and Node.js communities

---

**🎮 Ready to battle? Start your journey in the Abstract Battle Arena!**

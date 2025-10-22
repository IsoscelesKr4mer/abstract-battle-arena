const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  profilePicture: String,
  bio: String,
  
  // PvP Combat Statistics
  pvpStats: {
    totalDuels: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    totalStakeWon: { type: Number, default: 0 },
    totalStakeLost: { type: Number, default: 0 },
    winStreak: { type: Number, default: 0 },
    longestWinStreak: { type: Number, default: 0 },
    favoriteMove: { type: String, enum: ['Sword', 'Shield', 'Magic'], default: 'Sword' },
    lastBattleAt: Date
  },
  
  // Battle History
  battleHistory: [{
    duelId: { type: Number, required: true },
    opponent: { type: String, required: true },
    stake: { type: Number, required: true },
    rounds: { type: Number, required: true },
    won: { type: Boolean, required: true },
    moves: [{ type: String, enum: ['Sword', 'Shield', 'Magic'] }],
    battleDate: { type: Date, default: Date.now }
  }],
  
  // Social connections
  socialLinks: {
    twitter: String,
    discord: String
  },
  
  // Account settings
  settings: {
    notifications: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: true }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Calculate win rate
userSchema.virtual('winRate').get(function() {
  if (this.pvpStats.totalDuels === 0) return 0;
  return (this.pvpStats.wins / this.pvpStats.totalDuels) * 100;
});

// Calculate net profit
userSchema.virtual('netProfit').get(function() {
  return this.pvpStats.totalStakeWon - this.pvpStats.totalStakeLost;
});

// Update last active on save
userSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

// Indexes for better performance
userSchema.index({ walletAddress: 1 });
userSchema.index({ 'pvpStats.wins': -1 });
userSchema.index({ 'pvpStats.totalDuels': -1 });
userSchema.index({ lastActive: -1 });

module.exports = mongoose.model('User', userSchema);

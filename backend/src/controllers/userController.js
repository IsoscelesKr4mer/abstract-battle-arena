const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Get user stats and leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10, sortBy = 'wins' } = req.query;
    
    const sortOptions = {
      'wins': { 'pvpStats.wins': -1 },
      'totalDuels': { 'pvpStats.totalDuels': -1 },
      'winRate': { 'pvpStats.wins': -1, 'pvpStats.totalDuels': -1 },
      'totalStakeWon': { 'pvpStats.totalStakeWon': -1 }
    };

    const users = await User.find({ 'pvpStats.totalDuels': { $gt: 0 } })
      .select('walletAddress username pvpStats createdAt')
      .sort(sortOptions[sortBy] || sortOptions.wins)
      .limit(parseInt(limit));

    // Calculate win rates
    const leaderboard = users.map(user => ({
      walletAddress: user.walletAddress,
      username: user.username,
      pvpStats: {
        ...user.pvpStats.toObject(),
        winRate: user.pvpStats.totalDuels > 0 
          ? (user.pvpStats.wins / user.pvpStats.totalDuels) * 100 
          : 0
      },
      joinedAt: user.createdAt
    }));

    res.json({
      success: true,
      data: {
        leaderboard,
        total: leaderboard.length
      }
    });

  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
});

// Get user's battle history
router.get('/battle-history', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { limit = 20, offset = 0 } = req.query;
    
    const battleHistory = user.battleHistory
      .sort((a, b) => new Date(b.battleDate) - new Date(a.battleDate))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: {
        battleHistory,
        total: user.battleHistory.length,
        hasMore: user.battleHistory.length > parseInt(offset) + parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Battle history fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch battle history',
      error: error.message
    });
  }
});

// Get user statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate additional stats
    const winRate = user.pvpStats.totalDuels > 0 
      ? (user.pvpStats.wins / user.pvpStats.totalDuels) * 100 
      : 0;

    const netProfit = user.pvpStats.totalStakeWon - user.pvpStats.totalStakeLost;

    // Get recent performance (last 10 battles)
    const recentBattles = user.battleHistory
      .sort((a, b) => new Date(b.battleDate) - new Date(a.battleDate))
      .slice(0, 10);

    const recentWins = recentBattles.filter(battle => battle.won).length;
    const recentWinRate = recentBattles.length > 0 ? (recentWins / recentBattles.length) * 100 : 0;

    // Get move statistics
    const moveStats = user.battleHistory.reduce((acc, battle) => {
      battle.moves.forEach(move => {
        acc[move] = (acc[move] || 0) + 1;
      });
      return acc;
    }, {});

    const favoriteMove = Object.keys(moveStats).length > 0 
      ? Object.keys(moveStats).reduce((a, b) => moveStats[a] > moveStats[b] ? a : b)
      : 'Sword';

    res.json({
      success: true,
      data: {
        pvpStats: {
          ...user.pvpStats.toObject(),
          winRate: parseFloat(winRate.toFixed(2)),
          netProfit,
          recentWinRate: parseFloat(recentWinRate.toFixed(2)),
          favoriteMove,
          moveStats
        },
        battleHistory: {
          total: user.battleHistory.length,
          recent: recentBattles.length
        },
        account: {
          joinedAt: user.createdAt,
          lastActive: user.lastActive,
          username: user.username
        }
      }
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats',
      error: error.message
    });
  }
});

// Get user profile by address (public)
router.get('/profile/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const user = await User.findOne({ walletAddress: address.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only return public information
    const publicProfile = {
      walletAddress: user.walletAddress,
      username: user.username,
      profilePicture: user.profilePicture,
      bio: user.bio,
      pvpStats: user.pvpStats,
      socialLinks: user.socialLinks,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    };

    res.json({
      success: true,
      data: {
        user: publicProfile
      }
    });

  } catch (error) {
    console.error('Public profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// Update user statistics after battle
router.put('/stats/update', async (req, res) => {
  try {
    const { walletAddress, battleResult } = req.body;
    
    if (!walletAddress || !battleResult) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: walletAddress, battleResult'
      });
    }

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update PvP stats
    user.pvpStats.totalDuels += 1;
    
    if (battleResult.won) {
      user.pvpStats.wins += 1;
      user.pvpStats.totalStakeWon += battleResult.stake;
      user.pvpStats.winStreak += 1;
      
      if (user.pvpStats.winStreak > user.pvpStats.longestWinStreak) {
        user.pvpStats.longestWinStreak = user.pvpStats.winStreak;
      }
    } else {
      user.pvpStats.losses += 1;
      user.pvpStats.totalStakeLost += battleResult.stake;
      user.pvpStats.winStreak = 0;
    }

    user.pvpStats.lastBattleAt = new Date();

    // Add to battle history
    user.battleHistory.push({
      duelId: battleResult.duelId,
      opponent: battleResult.opponent,
      stake: battleResult.stake,
      rounds: battleResult.rounds,
      won: battleResult.won,
      moves: battleResult.moves,
      battleDate: new Date()
    });

    await user.save();

    res.json({
      success: true,
      data: {
        message: 'User stats updated successfully',
        updatedStats: user.pvpStats
      }
    });

  } catch (error) {
    console.error('Stats update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user stats',
      error: error.message
    });
  }
});

// Get user's active duels
router.get('/active-duels', verifyToken, async (req, res) => {
  try {
    // This would typically query the PvP controller or smart contract
    // For now, return empty array as active duels are managed in pvpController
    res.json({
      success: true,
      data: {
        activeDuels: [],
        message: 'Active duels are managed through the PvP endpoints'
      }
    });

  } catch (error) {
    console.error('Active duels fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active duels',
      error: error.message
    });
  }
});

module.exports = router;

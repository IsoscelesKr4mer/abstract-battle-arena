const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Abstract Wallet signature verification
const { ethers } = require('ethers');

const verifyWalletSignature = async (address, signature, message) => {
  try {
    // Verify the signature using ethers.js
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    
    // Check if the recovered address matches the provided address
    const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
    
    console.log('Signature verification:', {
      provided: address.toLowerCase(),
      recovered: recoveredAddress.toLowerCase(),
      valid: isValid
    });
    
    return isValid;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

// Authenticate user with wallet signature
router.post('/authenticate', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: walletAddress, signature, message'
      });
    }

    // Verify wallet signature
    const isValidSignature = await verifyWalletSignature(walletAddress, signature, message);
    
    if (!isValidSignature) {
      return res.status(401).json({
        success: false,
        message: 'Invalid wallet signature'
      });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      // Create new AGW user
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
        username: `AGW_${walletAddress.slice(0, 8)}`,
        bio: 'Abstract Battle Arena Warrior',
        pvpStats: {
          totalDuels: 0,
          wins: 0,
          losses: 0,
          totalStakeWon: 0,
          totalStakeLost: 0,
          winStreak: 0,
          longestWinStreak: 0,
          favoriteMove: 'Sword'
        },
        battleHistory: [],
        socialLinks: {
          twitter: '',
          discord: ''
        },
        settings: {
          notifications: true,
          publicProfile: true
        }
      });
      
      await user.save();
      console.log('New AGW user created:', user.walletAddress);
    } else {
      // Update last active
      user.lastActive = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        walletAddress: user.walletAddress,
        userId: user._id 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          walletAddress: user.walletAddress,
          username: user.username,
          profilePicture: user.profilePicture,
          bio: user.bio,
          pvpStats: user.pvpStats,
          socialLinks: user.socialLinks,
          settings: user.settings,
          createdAt: user.createdAt,
          lastActive: user.lastActive
        },
        message: 'Authentication successful'
      }
    });

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findOne({ walletAddress: decoded.walletAddress });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          walletAddress: user.walletAddress,
          username: user.username,
          profilePicture: user.profilePicture,
          bio: user.bio,
          pvpStats: user.pvpStats,
          battleHistory: user.battleHistory,
          socialLinks: user.socialLinks,
          settings: user.settings,
          createdAt: user.createdAt,
          lastActive: user.lastActive
        }
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findOne({ walletAddress: decoded.walletAddress });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { username, bio, socialLinks, settings } = req.body;

    // Update allowed fields
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
    if (settings) user.settings = { ...user.settings, ...settings };

    await user.save();

    res.json({
      success: true,
      data: {
        user: {
          walletAddress: user.walletAddress,
          username: user.username,
          profilePicture: user.profilePicture,
          bio: user.bio,
          pvpStats: user.pvpStats,
          socialLinks: user.socialLinks,
          settings: user.settings,
          createdAt: user.createdAt,
          lastActive: user.lastActive
        },
        message: 'Profile updated successfully'
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findOne({ walletAddress: decoded.walletAddress });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        walletAddress: user.walletAddress,
        userId: user._id 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token: newToken,
        message: 'Token refreshed successfully'
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: error.message
    });
  }
});

module.exports = router;

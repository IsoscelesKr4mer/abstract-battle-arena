const express = require('express');
const router = express.Router();

// Mock data for now - will be replaced with smart contract integration
let duels = [];
let duelCounter = 0;

// Create a new duel
router.post('/create', async (req, res) => {
  try {
    const { stake, totalRounds, playerAddress } = req.body;
    
    if (!stake || !totalRounds || !playerAddress) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: stake, totalRounds, playerAddress'
      });
    }

    if (totalRounds < 3 || totalRounds > 7) {
      return res.status(400).json({
        success: false,
        message: 'Total rounds must be between 3 and 7'
      });
    }

    duelCounter++;
    const newDuel = {
      id: duelCounter,
      player1: playerAddress,
      player2: null,
      stake: parseFloat(stake),
      totalRounds: parseInt(totalRounds),
      currentRound: 0,
      player1Wins: 0,
      player2Wins: 0,
      player1Moves: [],
      player2Moves: [],
      active: true,
      winner: null,
      createdAt: new Date().toISOString()
    };

    duels.push(newDuel);

    res.json({
      success: true,
      data: {
        duel: newDuel,
        message: 'Duel created successfully'
      }
    });
  } catch (error) {
    console.error('Error creating duel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create duel',
      error: error.message
    });
  }
});

// Join an existing duel
router.post('/join/:duelId', async (req, res) => {
  try {
    const { duelId } = req.params;
    const { playerAddress } = req.body;

    if (!playerAddress) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: playerAddress'
      });
    }

    const duel = duels.find(d => d.id === parseInt(duelId));
    
    if (!duel) {
      return res.status(404).json({
        success: false,
        message: 'Duel not found'
      });
    }

    if (duel.player2) {
      return res.status(400).json({
        success: false,
        message: 'Duel already has two players'
      });
    }

    if (duel.player1 === playerAddress) {
      return res.status(400).json({
        success: false,
        message: 'Cannot join your own duel'
      });
    }

    duel.player2 = playerAddress;
    duel.joinedAt = new Date().toISOString();

    res.json({
      success: true,
      data: {
        duel: duel,
        message: 'Successfully joined duel'
      }
    });
  } catch (error) {
    console.error('Error joining duel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join duel',
      error: error.message
    });
  }
});

// Get active duels
router.get('/active', async (req, res) => {
  try {
    const activeDuels = duels.filter(duel => duel.active && !duel.player2);
    
    res.json({
      success: true,
      data: {
        duels: activeDuels,
        total: activeDuels.length
      }
    });
  } catch (error) {
    console.error('Error fetching active duels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active duels',
      error: error.message
    });
  }
});

// Get duel details
router.get('/:duelId', async (req, res) => {
  try {
    const { duelId } = req.params;
    const duel = duels.find(d => d.id === parseInt(duelId));
    
    if (!duel) {
      return res.status(404).json({
        success: false,
        message: 'Duel not found'
      });
    }

    res.json({
      success: true,
      data: {
        duel: duel
      }
    });
  } catch (error) {
    console.error('Error fetching duel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch duel',
      error: error.message
    });
  }
});

// Commit a move
router.post('/:duelId/commit', async (req, res) => {
  try {
    const { duelId } = req.params;
    const { playerAddress, moveHash } = req.body;

    if (!playerAddress || !moveHash) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: playerAddress, moveHash'
      });
    }

    const duel = duels.find(d => d.id === parseInt(duelId));
    
    if (!duel) {
      return res.status(404).json({
        success: false,
        message: 'Duel not found'
      });
    }

    if (duel.player1 !== playerAddress && duel.player2 !== playerAddress) {
      return res.status(403).json({
        success: false,
        message: 'Not a player in this duel'
      });
    }

    // Add move hash to duel
    if (duel.player1 === playerAddress) {
      duel.player1MoveHash = moveHash;
    } else {
      duel.player2MoveHash = moveHash;
    }

    res.json({
      success: true,
      data: {
        message: 'Move committed successfully'
      }
    });
  } catch (error) {
    console.error('Error committing move:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to commit move',
      error: error.message
    });
  }
});

// Reveal a move
router.post('/:duelId/reveal', async (req, res) => {
  try {
    const { duelId } = req.params;
    const { playerAddress, move, salt } = req.body;

    if (!playerAddress || !move || !salt) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: playerAddress, move, salt'
      });
    }

    const duel = duels.find(d => d.id === parseInt(duelId));
    
    if (!duel) {
      return res.status(404).json({
        success: false,
        message: 'Duel not found'
      });
    }

    if (duel.player1 !== playerAddress && duel.player2 !== playerAddress) {
      return res.status(403).json({
        success: false,
        message: 'Not a player in this duel'
      });
    }

    // Verify move hash
    const moveHash = require('crypto')
      .createHash('sha256')
      .update(move + salt)
      .digest('hex');

    const expectedHash = duel.player1 === playerAddress ? 
      duel.player1MoveHash : duel.player2MoveHash;

    if (moveHash !== expectedHash) {
      return res.status(400).json({
        success: false,
        message: 'Invalid move hash'
      });
    }

    // Add move to duel
    if (duel.player1 === playerAddress) {
      duel.player1Moves.push(move);
    } else {
      duel.player2Moves.push(move);
    }

    // Process round if both players have revealed
    if (duel.player1Moves.length === duel.player2Moves.length) {
      const roundWinner = determineRoundWinner(
        duel.player1Moves[duel.player1Moves.length - 1],
        duel.player2Moves[duel.player2Moves.length - 1]
      );

      if (roundWinner === 'player1') {
        duel.player1Wins++;
      } else if (roundWinner === 'player2') {
        duel.player2Wins++;
      }

      duel.currentRound++;

      // Check if duel is complete
      const roundsToWin = Math.ceil(duel.totalRounds / 2);
      if (duel.player1Wins >= roundsToWin || duel.player2Wins >= roundsToWin) {
        duel.active = false;
        duel.winner = duel.player1Wins > duel.player2Wins ? duel.player1 : duel.player2;
        duel.completedAt = new Date().toISOString();
      }
    }

    res.json({
      success: true,
      data: {
        message: 'Move revealed successfully',
        roundWinner: duel.player1Moves.length === duel.player2Moves.length ? 
          determineRoundWinner(
            duel.player1Moves[duel.player1Moves.length - 1],
            duel.player2Moves[duel.player2Moves.length - 1]
          ) : null,
        duel: duel
      }
    });
  } catch (error) {
    console.error('Error revealing move:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reveal move',
      error: error.message
    });
  }
});

// Helper function to determine round winner
function determineRoundWinner(move1, move2) {
  if (move1 === move2) return 'tie';
  
  const winConditions = {
    'Sword': 'Magic',
    'Magic': 'Shield',
    'Shield': 'Sword'
  };

  if (winConditions[move1] === move2) {
    return 'player1';
  } else {
    return 'player2';
  }
}

// Get player's duels
router.get('/player/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const playerDuels = duels.filter(duel => 
      duel.player1 === address || duel.player2 === address
    );

    res.json({
      success: true,
      data: {
        duels: playerDuels,
        total: playerDuels.length
      }
    });
  } catch (error) {
    console.error('Error fetching player duels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch player duels',
      error: error.message
    });
  }
});

module.exports = router;

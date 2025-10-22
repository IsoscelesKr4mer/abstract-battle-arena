import React, { useState, useEffect } from 'react';
import { Sword, Shield, Zap, Trophy, Users, Clock, Target } from 'lucide-react';

interface Duel {
  id: number;
  player1: string;
  player2: string;
  stake: string;
  totalRounds: number;
  currentRound: number;
  player1Wins: number;
  player2Wins: number;
  active: boolean;
  winner: string;
}

interface Move {
  type: 'Sword' | 'Shield' | 'Magic';
  icon: React.ReactNode;
  beats: string;
  description: string;
}

const AbstractPvPCombat: React.FC = () => {
  const [activeDuels, setActiveDuels] = useState<Duel[]>([]);
  const [selectedDuel, setSelectedDuel] = useState<Duel | null>(null);
  const [stakeAmount, setStakeAmount] = useState('0.01');
  const [totalRounds, setTotalRounds] = useState(3);
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [opponentMove, setOpponentMove] = useState<Move | null>(null);
  const [gamePhase, setGamePhase] = useState<'lobby' | 'commit' | 'reveal' | 'result'>('lobby');
  const [loading, setLoading] = useState(false);

  const moves: Move[] = [
    {
      type: 'Sword',
      icon: <Sword className="w-8 h-8" />,
      beats: 'Magic',
      description: 'Sharp and aggressive'
    },
    {
      type: 'Shield',
      icon: <Shield className="w-8 h-8" />,
      beats: 'Sword',
      description: 'Defensive and sturdy'
    },
    {
      type: 'Magic',
      icon: <Zap className="w-8 h-8" />,
      beats: 'Shield',
      description: 'Mystical and powerful'
    }
  ];

  const createDuel = async () => {
    try {
      setLoading(true);
      // Call smart contract createDuel function
      console.log('Creating duel with stake:', stakeAmount, 'rounds:', totalRounds);
      // Implementation would call the smart contract
      
      // Mock success for now
      setTimeout(() => {
        setLoading(false);
        alert('Duel created successfully! (Mock implementation)');
      }, 1000);
    } catch (error) {
      console.error('Error creating duel:', error);
      setLoading(false);
    }
  };

  const joinDuel = async (duelId: number) => {
    try {
      setLoading(true);
      // Call smart contract joinDuel function
      console.log('Joining duel:', duelId);
      // Implementation would call the smart contract
      
      // Mock success for now
      setTimeout(() => {
        setLoading(false);
        alert('Successfully joined duel! (Mock implementation)');
      }, 1000);
    } catch (error) {
      console.error('Error joining duel:', error);
      setLoading(false);
    }
  };

  const commitMove = async (move: Move) => {
    try {
      // Generate salt and hash
      const salt = Math.random().toString(36);
      const moveHash = await hashMove(move.type, salt);
      
      // Call smart contract commitMove function
      console.log('Committing move:', move.type, 'hash:', moveHash);
      setPlayerMove(move);
      setGamePhase('reveal');
    } catch (error) {
      console.error('Error committing move:', error);
    }
  };

  const revealMove = async (move: Move, salt: string) => {
    try {
      // Call smart contract revealMove function
      console.log('Revealing move:', move.type, 'salt:', salt);
      setGamePhase('result');
    } catch (error) {
      console.error('Error revealing move:', error);
    }
  };

  const hashMove = async (move: string, salt: string): Promise<string> => {
    // This would use Web3 or ethers to hash the move
    return '0x' + Math.random().toString(16).substr(2, 64);
  };

  const getMoveIcon = (moveType: string) => {
    const move = moves.find(m => m.type === moveType);
    return move ? move.icon : null;
  };

  const determineWinner = (move1: string, move2: string): string => {
    if (move1 === move2) return 'tie';
    
    const move1Obj = moves.find(m => m.type === move1);
    if (move1Obj && move1Obj.beats === move2) return 'player1';
    
    return 'player2';
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockDuels: Duel[] = [
      {
        id: 1,
        player1: '0x1234...5678',
        player2: '',
        stake: '0.05',
        totalRounds: 3,
        currentRound: 0,
        player1Wins: 0,
        player2Wins: 0,
        active: true,
        winner: ''
      },
      {
        id: 2,
        player1: '0x9876...5432',
        player2: '',
        stake: '0.1',
        totalRounds: 5,
        currentRound: 0,
        player1Wins: 0,
        player2Wins: 0,
        active: true,
        winner: ''
      }
    ];
    setActiveDuels(mockDuels);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Abstract Battle Arena
          </h1>
          <p className="text-xl text-gray-300">
            Gigaverse-inspired 1v1 battles with real stakes
          </p>
        </div>

        {/* Game Rules */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Combat Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {moves.map((move) => (
              <div key={move.type} className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-blue-400 mb-2">{move.icon}</div>
                <h3 className="text-lg font-semibold text-white">{move.type}</h3>
                <p className="text-sm text-gray-300">{move.description}</p>
                <p className="text-xs text-green-400 mt-1">Beats: {move.beats}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Create Duel */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Create Duel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stake Amount (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Rounds
              </label>
              <select
                value={totalRounds}
                onChange={(e) => setTotalRounds(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>Best of 3</option>
                <option value={5}>Best of 5</option>
                <option value={7}>Best of 7</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={createDuel}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                {loading ? 'Creating...' : 'Create Duel'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Duels */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Active Duels</h2>
          <div className="space-y-4">
            {activeDuels.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No active duels</p>
            ) : (
              activeDuels.map((duel) => (
                <div key={duel.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Duel #{duel.id}
                      </h3>
                      <p className="text-sm text-gray-300">
                        Stake: {duel.stake} ETH | Rounds: {duel.totalRounds}
                      </p>
                      <p className="text-sm text-gray-300">
                        Player: {duel.player1}
                      </p>
                    </div>
                    <button
                      onClick={() => joinDuel(duel.id)}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                      {loading ? 'Joining...' : 'Join Duel'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Game Interface */}
        {selectedDuel && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Battle Arena</h2>
            
            {gamePhase === 'commit' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Choose Your Move</h3>
                <div className="grid grid-cols-3 gap-4">
                  {moves.map((move) => (
                    <button
                      key={move.type}
                      onClick={() => commitMove(move)}
                      className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-center transition-colors"
                    >
                      <div className="text-blue-400 mb-2">{move.icon}</div>
                      <h4 className="text-white font-semibold">{move.type}</h4>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gamePhase === 'reveal' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Reveal Your Move</h3>
                <p className="text-gray-300 mb-4">Both players have committed. Reveal your move!</p>
                <button
                  onClick={() => revealMove(playerMove!, 'salt')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Reveal Move
                </button>
              </div>
            )}

            {gamePhase === 'result' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Round Result</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-blue-400 mb-2">{getMoveIcon('Sword')}</div>
                    <p className="text-white">Your Move</p>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 mb-2">{getMoveIcon('Shield')}</div>
                    <p className="text-white">Opponent Move</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-400">You Win!</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Battle Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">0</h3>
              <p className="text-sm text-gray-300">Total Wins</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">0</h3>
              <p className="text-sm text-gray-300">Total Losses</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">0</h3>
              <p className="text-sm text-gray-300">Duels Played</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">0%</h3>
              <p className="text-sm text-gray-300">Win Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbstractPvPCombat;

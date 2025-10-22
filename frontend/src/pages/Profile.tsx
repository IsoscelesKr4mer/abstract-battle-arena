import React, { useState } from 'react';
import { Trophy, Target, Users, Clock, TrendingUp, Sword, Shield, Zap } from 'lucide-react';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [userStats] = useState({
    totalDuels: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalStakeWon: 0,
    totalStakeLost: 0,
    netProfit: 0,
    winStreak: 0,
    longestWinStreak: 0,
    favoriteMove: 'Sword'
  });

  const [battleHistory] = useState([
    // Mock battle history
  ]);

  const tabs = [
    { id: 'stats', name: 'Statistics', icon: Trophy },
    { id: 'history', name: 'Battle History', icon: Clock },
    { id: 'settings', name: 'Settings', icon: Target }
  ];

  const getMoveIcon = (move: string) => {
    switch (move) {
      case 'Sword': return <Sword className="w-4 h-4 text-red-500" />;
      case 'Shield': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'Magic': return <Zap className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">BA</span>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Battle Arena Player</h1>
              <p className="text-gray-600">0x1234...5678</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Active Fighter
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Battle Statistics</h2>
              
              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Wins</p>
                      <p className="text-2xl font-semibold text-gray-900">{userStats.wins}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-red-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Losses</p>
                      <p className="text-2xl font-semibold text-gray-900">{userStats.losses}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Duels Played</p>
                      <p className="text-2xl font-semibold text-gray-900">{userStats.totalDuels}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Win Rate</p>
                      <p className="text-2xl font-semibold text-gray-900">{userStats.winRate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Stake Won:</span>
                      <span className="font-semibold text-green-600">{userStats.totalStakeWon} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Stake Lost:</span>
                      <span className="font-semibold text-red-600">{userStats.totalStakeLost} ETH</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Net Profit:</span>
                      <span className={`font-semibold ${userStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {userStats.netProfit >= 0 ? '+' : ''}{userStats.netProfit} ETH
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Win Streak:</span>
                      <span className="font-semibold text-blue-600">{userStats.winStreak}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Longest Win Streak:</span>
                      <span className="font-semibold text-purple-600">{userStats.longestWinStreak}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Favorite Move:</span>
                      <div className="flex items-center space-x-1">
                        {getMoveIcon(userStats.favoriteMove)}
                        <span className="font-semibold">{userStats.favoriteMove}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Battle History Tab */}
          {activeTab === 'history' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Battle History</h2>
              
              {battleHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No battles yet</p>
                  <p className="text-sm text-gray-400">Start your first duel to see your battle history here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {battleHistory.map((battle, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-900">Duel #{battle.duelId}</h3>
                          <p className="text-sm text-gray-600">vs {battle.opponent}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${battle.won ? 'text-green-600' : 'text-red-600'}`}>
                            {battle.won ? 'Victory' : 'Defeat'}
                          </p>
                          <p className="text-sm text-gray-600">{battle.stake} ETH</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifications"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
                    Enable battle notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="publicProfile"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="publicProfile" className="ml-2 block text-sm text-gray-700">
                    Make profile public
                  </label>
                </div>
                
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

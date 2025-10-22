import React, { useState } from 'react';
import { Wallet, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const WalletConnection: React.FC = () => {
  const { connectWallet, authenticate, disconnect, isAuthenticated, isLoading, user } = useAuth();
  const [error, setError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError('');
      await connectWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAuthenticate = async () => {
    try {
      setIsConnecting(true);
      setError('');
      await authenticate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setError('');
  };

  // Check if Abstract Wallet is available
  const isAGWAvailable = typeof window !== 'undefined' && (window as any).abstract;

  if (isAuthenticated && user) {
    return (
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="text-green-400 font-semibold">Connected to Abstract Wallet</h3>
              <p className="text-gray-300 text-sm">
                {user.username} • {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
              </p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
      <div className="text-center">
        <Wallet className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-gray-300 mb-6">
          Connect your Abstract Wallet to start battling in the arena
        </p>

        {!isAGWAvailable && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <div className="text-left">
                <h3 className="text-yellow-400 font-semibold">Abstract Wallet Required</h3>
                <p className="text-gray-300 text-sm">
                  Please install the Abstract Wallet extension to continue
                </p>
                <a
                  href="https://abstract.network/wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm underline mt-1 inline-block"
                >
                  Install Abstract Wallet →
                </a>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {!user ? (
            <button
              onClick={handleConnect}
              disabled={!isAGWAvailable || isConnecting || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center space-x-2"
            >
              {isConnecting || isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  <span>Connect Abstract Wallet</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleAuthenticate}
              disabled={isConnecting || isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center space-x-2"
            >
              {isConnecting || isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Sign Message to Authenticate</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-400">
          <p>🔐 Your wallet connection is secure and private</p>
          <p>⚡ Powered by Abstract Network</p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnection;

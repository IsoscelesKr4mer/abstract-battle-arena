import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  walletAddress: string;
  username?: string;
  profilePicture?: string;
  bio?: string;
  pvpStats: {
    totalDuels: number;
    wins: number;
    losses: number;
    totalStakeWon: number;
    totalStakeLost: number;
    winStreak: number;
    longestWinStreak: number;
    favoriteMove: string;
    lastBattleAt?: Date;
  };
  battleHistory: Array<{
    duelId: number;
    opponent: string;
    stake: number;
    rounds: number;
    won: boolean;
    moves: string[];
    battleDate: Date;
  }>;
  socialLinks: {
    twitter?: string;
    discord?: string;
  };
  settings: {
    notifications: boolean;
    publicProfile: boolean;
  };
  createdAt: Date;
  lastActive: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  authenticate: () => Promise<void>;
  disconnect: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Abstract Wallet connection
  const connectWallet = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Check if Abstract Wallet is available
      if (typeof window !== 'undefined' && (window as any).abstract) {
        const abstract = (window as any).abstract;
        
        // Request connection
        const accounts = await abstract.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts && accounts.length > 0) {
          const walletAddress = accounts[0];
          
          // Get user info from Abstract Wallet
          const userInfo = await abstract.request({
            method: 'abstract_getUserInfo'
          });
          
          // Create user object with AGW data
          const agwUser: User = {
            walletAddress: walletAddress.toLowerCase(),
            username: userInfo?.username || `AGW_${walletAddress.slice(0, 8)}`,
            profilePicture: userInfo?.avatar || '',
            bio: userInfo?.bio || 'Abstract Battle Arena Warrior',
            pvpStats: {
              totalDuels: 0,
              wins: 0,
              losses: 0,
              totalStakeWon: 0,
              totalStakeLost: 0,
              winStreak: 0,
              longestWinStreak: 0,
              favoriteMove: 'Sword',
              lastBattleAt: undefined
            },
            battleHistory: [],
            socialLinks: {
              twitter: userInfo?.twitter || '',
              discord: userInfo?.discord || ''
            },
            settings: {
              notifications: true,
              publicProfile: true
            },
            createdAt: new Date(),
            lastActive: new Date()
          };
          
          setUser(agwUser);
          setIsAuthenticated(true);
          
          // Store AGW connection info
          localStorage.setItem('agwConnected', 'true');
          localStorage.setItem('agwAddress', walletAddress);
          
        } else {
          throw new Error('No accounts found in Abstract Wallet');
        }
      } else {
        throw new Error('Abstract Wallet not detected. Please install Abstract Wallet extension.');
      }
      
    } catch (error) {
      console.error('Abstract Wallet connection failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // AGW signature authentication
  const authenticate = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (typeof window !== 'undefined' && (window as any).abstract && user) {
        const abstract = (window as any).abstract;
        
        // Create authentication message
        const message = `Welcome to Abstract Battle Arena!
        
Sign this message to authenticate with your Abstract Wallet.

Wallet: ${user.walletAddress}
Timestamp: ${Date.now()}`;
        
        // Request signature from AGW
        const signature = await abstract.request({
          method: 'personal_sign',
          params: [message, user.walletAddress]
        });
        
        // Authenticate with backend using signature
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/authenticate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: user.walletAddress,
            signature: signature,
            message: message
          })
        });
        
        const authData = await response.json();
        
        if (authData.success) {
          // Store authentication token
          localStorage.setItem('battleArenaToken', authData.data.token);
          localStorage.setItem('battleArenaUser', JSON.stringify(authData.data.user));
          
          // Update user with server data
          setUser(authData.data.user);
          setIsAuthenticated(true);
          
          console.log('AGW Authentication successful');
        } else {
          throw new Error(authData.message || 'Authentication failed');
        }
        
      } else {
        throw new Error('Abstract Wallet not connected');
      }
      
    } catch (error) {
      console.error('AGW Authentication failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnect = (): void => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear all stored data
    localStorage.removeItem('battleArenaToken');
    localStorage.removeItem('battleArenaUser');
    localStorage.removeItem('agwConnected');
    localStorage.removeItem('agwAddress');
    
    console.log('Abstract Wallet disconnected');
  };

  // Update user data
  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const storedUser = localStorage.getItem('battleArenaUser');
        const storedToken = localStorage.getItem('battleArenaToken');
        const agwConnected = localStorage.getItem('agwConnected');
        
        if (storedUser && storedToken && agwConnected) {
          // Verify AGW is still connected
          if (typeof window !== 'undefined' && (window as any).abstract) {
            try {
              const abstract = (window as any).abstract;
              const accounts = await abstract.request({
                method: 'eth_accounts'
              });
              
              if (accounts && accounts.length > 0) {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
              } else {
                // AGW disconnected, clear local storage
                localStorage.removeItem('battleArenaToken');
                localStorage.removeItem('battleArenaUser');
                localStorage.removeItem('agwConnected');
                localStorage.removeItem('agwAddress');
              }
            } catch (error) {
              console.error('Error verifying AGW connection:', error);
              // Clear invalid session
              localStorage.removeItem('battleArenaToken');
              localStorage.removeItem('battleArenaUser');
              localStorage.removeItem('agwConnected');
              localStorage.removeItem('agwAddress');
            }
          }
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
      }
    };

    checkExistingSession();
  }, []);

  // Save user data to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('battleArenaUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('battleArenaUser');
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    connectWallet,
    authenticate,
    disconnect,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

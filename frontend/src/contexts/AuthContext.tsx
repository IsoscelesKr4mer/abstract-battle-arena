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

  // Mock wallet connection
  const connectWallet = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        walletAddress: '0x1234567890123456789012345678901234567890',
        username: 'BattleMaster',
        profilePicture: '',
        bio: 'Abstract Battle Arena Champion',
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
          twitter: '',
          discord: ''
        },
        settings: {
          notifications: true,
          publicProfile: true
        },
        createdAt: new Date(),
        lastActive: new Date()
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock authentication
  const authenticate = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate authentication process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, this would verify wallet signature
      console.log('Authentication successful (mock)');
      
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnect = (): void => {
    setUser(null);
    setIsAuthenticated(false);
    console.log('Wallet disconnected');
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
        // In a real implementation, check for stored session/token
        const storedUser = localStorage.getItem('battleArenaUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
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

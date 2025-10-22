import axios from 'axios';

// API base URL - will be set via environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('battleArenaToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('battleArenaToken');
      localStorage.removeItem('battleArenaUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// PvP API functions
export const pvpAPI = {
  // Create a new duel
  createDuel: async (stake: number, totalRounds: number, playerAddress: string) => {
    const response = await api.post('/pvp/create', {
      stake,
      totalRounds,
      playerAddress
    });
    return response.data;
  },

  // Join an existing duel
  joinDuel: async (duelId: number, playerAddress: string) => {
    const response = await api.post(`/pvp/join/${duelId}`, {
      playerAddress
    });
    return response.data;
  },

  // Get active duels
  getActiveDuels: async () => {
    const response = await api.get('/pvp/active');
    return response.data;
  },

  // Get duel details
  getDuelDetails: async (duelId: number) => {
    const response = await api.get(`/pvp/${duelId}`);
    return response.data;
  },

  // Commit a move
  commitMove: async (duelId: number, playerAddress: string, moveHash: string) => {
    const response = await api.post(`/pvp/${duelId}/commit`, {
      playerAddress,
      moveHash
    });
    return response.data;
  },

  // Reveal a move
  revealMove: async (duelId: number, playerAddress: string, move: string, salt: string) => {
    const response = await api.post(`/pvp/${duelId}/reveal`, {
      playerAddress,
      move,
      salt
    });
    return response.data;
  },

  // Get player's duels
  getPlayerDuels: async (playerAddress: string) => {
    const response = await api.get(`/pvp/player/${playerAddress}`);
    return response.data;
  }
};

// User API functions
export const userAPI = {
  // Get public user profile
  getPublicProfile: async (walletAddress: string) => {
    const response = await api.get(`/users/profile/${walletAddress}`);
    return response.data;
  },

  // Get user statistics (requires authentication)
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Get user battle history (requires authentication)
  getBattleHistory: async (limit?: number, offset?: number) => {
    const response = await api.get('/users/battle-history', {
      params: { limit, offset }
    });
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (limit?: number, sortBy?: string) => {
    const response = await api.get('/users/leaderboard', {
      params: { limit, sortBy }
    });
    return response.data;
  },

  // Get active duels (requires authentication)
  getActiveDuels: async () => {
    const response = await api.get('/users/active-duels');
    return response.data;
  }
};

// Auth API functions
export const authAPI = {
  // Authenticate with wallet signature
  authenticate: async (walletAddress: string, signature: string, message: string) => {
    const response = await api.post('/auth/authenticate', {
      walletAddress,
      signature,
      message
    });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
};

// Smart contract interaction functions
export const contractAPI = {
  // Get contract instance (would be implemented with Web3/ethers)
  getContract: () => {
    // This would return a Web3 contract instance
    console.log('Contract API - would return Web3 contract instance');
    return null;
  },

  // Call smart contract methods
  callContractMethod: async (method: string, params: any[]) => {
    // This would call the actual smart contract
    console.log('Calling contract method:', method, 'with params:', params);
    return { success: true, data: 'Mock contract response' };
  }
};

export default api;

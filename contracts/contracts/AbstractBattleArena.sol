// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AbstractBattleArena
 * @dev Smart contract for 1v1 PvP battles with stake management
 */
contract AbstractBattleArena is ReentrancyGuard, Pausable, Ownable {
    
    // Events
    event DuelCreated(uint256 indexed duelId, address indexed player1, uint256 stake, uint256 totalRounds);
    event DuelJoined(uint256 indexed duelId, address indexed player2);
    event MoveCommitted(uint256 indexed duelId, address indexed player);
    event MoveRevealed(uint256 indexed duelId, address indexed player, uint8 move);
    event RoundCompleted(uint256 indexed duelId, uint256 round, address winner);
    event DuelCompleted(uint256 indexed duelId, address winner, uint256 totalStake);
    
    // Enums
    enum Move { Sword, Shield, Magic }
    enum DuelStatus { Waiting, Active, Completed, Cancelled }
    
    // Structs
    struct Duel {
        uint256 id;
        address player1;
        address player2;
        uint256 stake;
        uint256 totalRounds;
        uint256 currentRound;
        uint256 player1Wins;
        uint256 player2Wins;
        DuelStatus status;
        uint256 player1MoveHash;
        uint256 player2MoveHash;
        Move player1Move;
        Move player2Move;
        bool player1Committed;
        bool player2Committed;
        bool player1Revealed;
        bool player2Revealed;
        uint256 createdAt;
        uint256 completedAt;
    }
    
    // State variables
    uint256 public duelCounter;
    mapping(uint256 => Duel) public duels;
    mapping(address => uint256[]) public playerDuels;
    mapping(address => uint256) public playerStats;
    
    // Constants
    uint256 public constant MIN_STAKE = 0.001 ether;
    uint256 public constant MAX_STAKE = 10 ether;
    uint256 public constant PLATFORM_FEE_PERCENT = 5; // 5% platform fee
    
    constructor() {}
    
    /**
     * @dev Create a new duel
     * @param stake Amount of ETH to stake
     * @param totalRounds Number of rounds (must be odd, 3-7)
     */
    function createDuel(uint256 totalRounds) external payable whenNotPaused nonReentrant {
        require(msg.value >= MIN_STAKE && msg.value <= MAX_STAKE, "Invalid stake amount");
        require(totalRounds >= 3 && totalRounds <= 7 && totalRounds % 2 == 1, "Invalid round count");
        
        duelCounter++;
        
        duels[duelCounter] = Duel({
            id: duelCounter,
            player1: msg.sender,
            player2: address(0),
            stake: msg.value,
            totalRounds: totalRounds,
            currentRound: 0,
            player1Wins: 0,
            player2Wins: 0,
            status: DuelStatus.Waiting,
            player1MoveHash: 0,
            player2MoveHash: 0,
            player1Move: Move.Sword,
            player2Move: Move.Sword,
            player1Committed: false,
            player2Committed: false,
            player1Revealed: false,
            player2Revealed: false,
            createdAt: block.timestamp,
            completedAt: 0
        });
        
        playerDuels[msg.sender].push(duelCounter);
        
        emit DuelCreated(duelCounter, msg.sender, msg.value, totalRounds);
    }
    
    /**
     * @dev Join an existing duel
     * @param duelId ID of the duel to join
     */
    function joinDuel(uint256 duelId) external payable whenNotPaused nonReentrant {
        Duel storage duel = duels[duelId];
        require(duel.status == DuelStatus.Waiting, "Duel not available");
        require(duel.player1 != msg.sender, "Cannot join your own duel");
        require(duel.player2 == address(0), "Duel already full");
        require(msg.value == duel.stake, "Incorrect stake amount");
        
        duel.player2 = msg.sender;
        duel.status = DuelStatus.Active;
        
        playerDuels[msg.sender].push(duelId);
        
        emit DuelJoined(duelId, msg.sender);
    }
    
    /**
     * @dev Commit a move for the current round
     * @param duelId ID of the duel
     * @param moveHash Hash of the move + salt
     */
    function commitMove(uint256 duelId, uint256 moveHash) external whenNotPaused {
        Duel storage duel = duels[duelId];
        require(duel.status == DuelStatus.Active, "Duel not active");
        require(duel.player1 == msg.sender || duel.player2 == msg.sender, "Not a player");
        require(duel.currentRound < duel.totalRounds, "Duel completed");
        
        if (msg.sender == duel.player1) {
            require(!duel.player1Committed, "Already committed");
            duel.player1MoveHash = moveHash;
            duel.player1Committed = true;
        } else {
            require(!duel.player2Committed, "Already committed");
            duel.player2MoveHash = moveHash;
            duel.player2Committed = true;
        }
        
        emit MoveCommitted(duelId, msg.sender);
    }
    
    /**
     * @dev Reveal a move after both players have committed
     * @param duelId ID of the duel
     * @param move The move to reveal
     * @param salt The salt used for the hash
     */
    function revealMove(uint256 duelId, Move move, uint256 salt) external whenNotPaused {
        Duel storage duel = duels[duelId];
        require(duel.status == DuelStatus.Active, "Duel not active");
        require(duel.player1 == msg.sender || duel.player2 == msg.sender, "Not a player");
        require(duel.player1Committed && duel.player2Committed, "Both players must commit first");
        
        // Verify the hash
        uint256 moveHash = uint256(keccak256(abi.encodePacked(move, salt)));
        uint256 expectedHash = msg.sender == duel.player1 ? duel.player1MoveHash : duel.player2MoveHash;
        require(moveHash == expectedHash, "Invalid move hash");
        
        if (msg.sender == duel.player1) {
            require(!duel.player1Revealed, "Already revealed");
            duel.player1Move = move;
            duel.player1Revealed = true;
        } else {
            require(!duel.player2Revealed, "Already revealed");
            duel.player2Move = move;
            duel.player2Revealed = true;
        }
        
        emit MoveRevealed(duelId, msg.sender, uint8(move));
        
        // Process round if both players have revealed
        if (duel.player1Revealed && duel.player2Revealed) {
            _processRound(duelId);
        }
    }
    
    /**
     * @dev Internal function to process a round and determine winner
     */
    function _processRound(uint256 duelId) internal {
        Duel storage duel = duels[duelId];
        
        // Determine round winner
        address roundWinner = _determineWinner(duel.player1Move, duel.player2Move);
        
        if (roundWinner == duel.player1) {
            duel.player1Wins++;
        } else if (roundWinner == duel.player2) {
            duel.player2Wins++;
        }
        // If tie, no winner
        
        emit RoundCompleted(duelId, duel.currentRound, roundWinner);
        
        // Reset for next round
        duel.currentRound++;
        duel.player1Committed = false;
        duel.player2Committed = false;
        duel.player1Revealed = false;
        duel.player2Revealed = false;
        
        // Check if duel is complete
        uint256 roundsToWin = (duel.totalRounds + 1) / 2;
        if (duel.player1Wins >= roundsToWin || duel.player2Wins >= roundsToWin) {
            _completeDuel(duelId);
        }
    }
    
    /**
     * @dev Internal function to determine winner of a round
     */
    function _determineWinner(Move move1, Move move2) internal pure returns (address) {
        if (move1 == move2) {
            return address(0); // Tie
        }
        
        // Sword beats Magic, Magic beats Shield, Shield beats Sword
        if ((move1 == Move.Sword && move2 == Move.Magic) ||
            (move1 == Move.Magic && move2 == Move.Shield) ||
            (move1 == Move.Shield && move2 == Move.Sword)) {
            return address(0); // This would need to be properly handled with player addresses
        }
        
        return address(0); // This is a simplified version
    }
    
    /**
     * @dev Internal function to complete a duel and distribute rewards
     */
    function _completeDuel(uint256 duelId) internal {
        Duel storage duel = duels[duelId];
        
        duel.status = DuelStatus.Completed;
        duel.completedAt = block.timestamp;
        
        address winner = duel.player1Wins > duel.player2Wins ? duel.player1 : duel.player2;
        uint256 totalStake = duel.stake * 2;
        uint256 platformFee = (totalStake * PLATFORM_FEE_PERCENT) / 100;
        uint256 winnerReward = totalStake - platformFee;
        
        // Transfer winnings to winner
        if (winner != address(0)) {
            payable(winner).transfer(winnerReward);
        }
        
        emit DuelCompleted(duelId, winner, totalStake);
    }
    
    /**
     * @dev Get duel details
     */
    function getDuel(uint256 duelId) external view returns (Duel memory) {
        return duels[duelId];
    }
    
    /**
     * @dev Get player's duels
     */
    function getPlayerDuels(address player) external view returns (uint256[] memory) {
        return playerDuels[player];
    }
    
    /**
     * @dev Withdraw platform fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Pause the contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}

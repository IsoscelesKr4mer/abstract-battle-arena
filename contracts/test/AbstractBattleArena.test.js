const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AbstractBattleArena", function () {
  let battleArena;
  let owner;
  let player1;
  let player2;
  let player3;

  const MIN_STAKE = ethers.parseEther("0.001");
  const STAKE_AMOUNT = ethers.parseEther("0.1");

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();
    
    const AbstractBattleArena = await ethers.getContractFactory("AbstractBattleArena");
    battleArena = await AbstractBattleArena.deploy();
    await battleArena.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await battleArena.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero duels", async function () {
      expect(await battleArena.duelCounter()).to.equal(0);
    });
  });

  describe("Duel Creation", function () {
    it("Should create a duel with correct parameters", async function () {
      await expect(battleArena.connect(player1).createDuel(3, { value: STAKE_AMOUNT }))
        .to.emit(battleArena, "DuelCreated")
        .withArgs(1, player1.address, STAKE_AMOUNT, 3);

      const duel = await battleArena.getDuel(1);
      expect(duel.player1).to.equal(player1.address);
      expect(duel.stake).to.equal(STAKE_AMOUNT);
      expect(duel.totalRounds).to.equal(3);
    });

    it("Should reject duel creation with invalid stake amount", async function () {
      await expect(battleArena.connect(player1).createDuel(3, { value: MIN_STAKE / 2n }))
        .to.be.revertedWith("Invalid stake amount");

      await expect(battleArena.connect(player1).createDuel(3, { value: ethers.parseEther("11") }))
        .to.be.revertedWith("Invalid stake amount");
    });

    it("Should reject duel creation with invalid round count", async function () {
      await expect(battleArena.connect(player1).createDuel(2, { value: STAKE_AMOUNT }))
        .to.be.revertedWith("Invalid round count");

      await expect(battleArena.connect(player1).createDuel(8, { value: STAKE_AMOUNT }))
        .to.be.revertedWith("Invalid round count");

      await expect(battleArena.connect(player1).createDuel(4, { value: STAKE_AMOUNT }))
        .to.be.revertedWith("Invalid round count");
    });
  });

  describe("Duel Joining", function () {
    beforeEach(async function () {
      await battleArena.connect(player1).createDuel(3, { value: STAKE_AMOUNT });
    });

    it("Should allow player2 to join duel", async function () {
      await expect(battleArena.connect(player2).joinDuel(1, { value: STAKE_AMOUNT }))
        .to.emit(battleArena, "DuelJoined")
        .withArgs(1, player2.address);

      const duel = await battleArena.getDuel(1);
      expect(duel.player2).to.equal(player2.address);
      expect(duel.status).to.equal(1); // Active status
    });

    it("Should reject joining own duel", async function () {
      await expect(battleArena.connect(player1).joinDuel(1, { value: STAKE_AMOUNT }))
        .to.be.revertedWith("Cannot join your own duel");
    });

    it("Should reject joining with wrong stake amount", async function () {
      await expect(battleArena.connect(player2).joinDuel(1, { value: MIN_STAKE }))
        .to.be.revertedWith("Incorrect stake amount");
    });

    it("Should reject joining completed duel", async function () {
      await battleArena.connect(player2).joinDuel(1, { value: STAKE_AMOUNT });
      await expect(battleArena.connect(player3).joinDuel(1, { value: STAKE_AMOUNT }))
        .to.be.revertedWith("Duel already full");
    });
  });

  describe("Move Commitment", function () {
    beforeEach(async function () {
      await battleArena.connect(player1).createDuel(3, { value: STAKE_AMOUNT });
      await battleArena.connect(player2).joinDuel(1, { value: STAKE_AMOUNT });
    });

    it("Should allow players to commit moves", async function () {
      const moveHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint8", "uint256"], [0, 12345])); // Sword with salt 12345

      await expect(battleArena.connect(player1).commitMove(1, moveHash))
        .to.emit(battleArena, "MoveCommitted")
        .withArgs(1, player1.address);

      await expect(battleArena.connect(player2).commitMove(1, moveHash))
        .to.emit(battleArena, "MoveCommitted")
        .withArgs(1, player2.address);
    });

    it("Should reject move commitment from non-players", async function () {
      const moveHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint8", "uint256"], [0, 12345]));

      await expect(battleArena.connect(player3).commitMove(1, moveHash))
        .to.be.revertedWith("Not a player");
    });

    it("Should reject double commitment", async function () {
      const moveHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint8", "uint256"], [0, 12345]));

      await battleArena.connect(player1).commitMove(1, moveHash);
      await expect(battleArena.connect(player1).commitMove(1, moveHash))
        .to.be.revertedWith("Already committed");
    });
  });

  describe("Move Revelation", function () {
    beforeEach(async function () {
      await battleArena.connect(player1).createDuel(3, { value: STAKE_AMOUNT });
      await battleArena.connect(player2).joinDuel(1, { value: STAKE_AMOUNT });
    });

    it("Should allow players to reveal moves after both committed", async function () {
      const salt1 = 12345;
      const salt2 = 67890;
      const moveHash1 = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint8", "uint256"], [0, salt1])); // Sword
      const moveHash2 = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint8", "uint256"], [1, salt2])); // Shield

      await battleArena.connect(player1).commitMove(1, moveHash1);
      await battleArena.connect(player2).commitMove(1, moveHash2);

      await expect(battleArena.connect(player1).revealMove(1, 0, salt1)) // Sword
        .to.emit(battleArena, "MoveRevealed")
        .withArgs(1, player1.address, 0);

      await expect(battleArena.connect(player2).revealMove(1, 1, salt2)) // Shield
        .to.emit(battleArena, "MoveRevealed")
        .withArgs(1, player2.address, 1);
    });

    it("Should reject revelation with wrong hash", async function () {
      const salt1 = 12345;
      const moveHash1 = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint8", "uint256"], [0, salt1]));

      await battleArena.connect(player1).commitMove(1, moveHash1);
      await battleArena.connect(player2).commitMove(1, moveHash1);

      await expect(battleArena.connect(player1).revealMove(1, 1, salt1)) // Wrong move
        .to.be.revertedWith("Invalid move hash");
    });
  });

  describe("Access Control", function () {
    it("Should allow only owner to pause", async function () {
      await expect(battleArena.connect(player1).pause())
        .to.be.revertedWith("Ownable: caller is not the owner");

      await expect(battleArena.connect(owner).pause())
        .to.not.be.reverted;
    });

    it("Should prevent operations when paused", async function () {
      await battleArena.connect(owner).pause();

      await expect(battleArena.connect(player1).createDuel(3, { value: STAKE_AMOUNT }))
        .to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple duels correctly", async function () {
      await battleArena.connect(player1).createDuel(3, { value: STAKE_AMOUNT });
      await battleArena.connect(player2).createDuel(5, { value: STAKE_AMOUNT });

      expect(await battleArena.duelCounter()).to.equal(2);

      const duel1 = await battleArena.getDuel(1);
      const duel2 = await battleArena.getDuel(2);

      expect(duel1.player1).to.equal(player1.address);
      expect(duel2.player1).to.equal(player2.address);
    });
  });
});

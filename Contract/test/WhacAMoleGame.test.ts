import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("WhacAMoleGame", function () {
  // Fixture to deploy contracts
  async function deployContractsFixture() {
    const [owner, player1, player2, player3] = await hre.ethers.getSigners();

    // Deploy NFT contract
    const WhacAMoleNFT = await hre.ethers.getContractFactory("WhacAMoleNFT");
    const baseURI = "https://api.whacamole.game/metadata/";
    const nftContract = await WhacAMoleNFT.deploy(owner.address, baseURI);

    // Deploy game contract
    const WhacAMoleGame = await hre.ethers.getContractFactory("WhacAMoleGame");
    const gameContract = await WhacAMoleGame.deploy(owner.address);

    // Set up contract connections
    await gameContract.setNFTContract(await nftContract.getAddress());
    await nftContract.setGameContract(await gameContract.getAddress());

    return { gameContract, nftContract, owner, player1, player2, player3 };
  }

  describe("Deployment", function () {
    it("Should deploy contracts correctly", async function () {
      const { gameContract, nftContract, owner } = await loadFixture(deployContractsFixture);
      
      expect(await gameContract.owner()).to.equal(owner.address);
      expect(await nftContract.owner()).to.equal(owner.address);
      expect(await gameContract.nftContract()).to.equal(await nftContract.getAddress());
      expect(await nftContract.gameContract()).to.equal(await gameContract.getAddress());
    });

    it("Should initialize with correct constants", async function () {
      const { gameContract } = await loadFixture(deployContractsFixture);
      
      expect(await gameContract.GAME_DURATION()).to.equal(120);
      expect(await gameContract.MIN_SCORE_FOR_LEADERBOARD()).to.equal(100);
      expect(await gameContract.MAX_LEADERBOARD_SIZE()).to.equal(100);
      expect(await gameContract.BEGINNER_THRESHOLD()).to.equal(1000);
      expect(await gameContract.PRO_THRESHOLD()).to.equal(5000);
      expect(await gameContract.MASTER_THRESHOLD()).to.equal(10000);
    });
  });

  describe("Player Registration", function () {
    it("Should register a new player", async function () {
      const { gameContract, player1 } = await loadFixture(deployContractsFixture);
      
      await expect(gameContract.connect(player1).registerPlayer("TestPlayer"))
        .to.emit(gameContract, "PlayerRegistered")
        .withArgs(player1.address, "TestPlayer");

      const player = await gameContract.getPlayer(player1.address);
      expect(player.isRegistered).to.be.true;
      expect(player.username).to.equal("TestPlayer");
      expect(player.totalGamesPlayed).to.equal(0);
      expect(player.totalScore).to.equal(0);
    });

    it("Should not allow duplicate registration", async function () {
      const { gameContract, player1 } = await loadFixture(deployContractsFixture);
      
      await gameContract.connect(player1).registerPlayer("TestPlayer");
      
      await expect(gameContract.connect(player1).registerPlayer("TestPlayer2"))
        .to.be.revertedWith("Player already registered");
    });

    it("Should not allow empty username", async function () {
      const { gameContract, player1 } = await loadFixture(deployContractsFixture);
      
      await expect(gameContract.connect(player1).registerPlayer(""))
        .to.be.revertedWith("Invalid username length");
    });

    it("Should not allow username longer than 32 characters", async function () {
      const { gameContract, player1 } = await loadFixture(deployContractsFixture);
      
      const longUsername = "a".repeat(33);
      await expect(gameContract.connect(player1).registerPlayer(longUsername))
        .to.be.revertedWith("Invalid username length");
    });

    it("Should update username", async function () {
      const { gameContract, player1 } = await loadFixture(deployContractsFixture);
      
      await gameContract.connect(player1).registerPlayer("TestPlayer");
      await gameContract.connect(player1).updateUsername("NewUsername");
      
      const player = await gameContract.getPlayer(player1.address);
      expect(player.username).to.equal("NewUsername");
    });
  });

  describe("Game Sessions", function () {
    it("Should start a game session", async function () {
      const { gameContract, player1 } = await loadFixture(deployContractsFixture);
      
      await gameContract.connect(player1).registerPlayer("TestPlayer");
      
      await expect(gameContract.connect(player1).startGame())
        .to.emit(gameContract, "GameStarted")
        .withArgs(player1.address, 1);

      const gameSession = await gameContract.getGameSession(1);
      expect(gameSession.player).to.equal(player1.address);
      expect(gameSession.isCompleted).to.be.false;
    });

    it("Should not allow unregistered player to start game", async function () {
      const { gameContract, player1 } = await loadFixture(deployContractsFixture);
      
      await expect(gameContract.connect(player1).startGame())
        .to.be.revertedWith("Player not registered");
    });

    it("Should complete a game session", async function () {
      const { gameContract, player1 } = await loadFixture(deployContractsFixture);
      
      await gameContract.connect(player1).registerPlayer("TestPlayer");
      await gameContract.connect(player1).startGame();
      
      const score = 1500;
      const molesHit = 75;
      const level = 3;
      
      await expect(gameContract.connect(player1).completeGame(1, score, molesHit, level))
        .to.emit(gameContract, "GameCompleted")
        .withArgs(player1.address, 1, score);

      const gameSession = await gameContract.getGameSession(1);
      expect(gameSession.isCompleted).to.be.true;
      expect(gameSession.score).to.equal(score);
      expect(gameSession.molesHit).to.equal(molesHit);
      expect(gameSession.level).to.equal(level);

      const player = await gameContract.getPlayer(player1.address);
      expect(player.totalGamesPlayed).to.equal(1);
      expect(player.totalScore).to.equal(score);
      expect(player.highestScore).to.equal(score);
      expect(player.totalMolesHit).to.equal(molesHit);
    });

    it("Should not allow completing someone else's game", async function () {
      const { gameContract, player1, player2 } = await loadFixture(deployContractsFixture);
      
      await gameContract.connect(player1).registerPlayer("TestPlayer1");
      await gameContract.connect(player2).registerPlayer("TestPlayer2");
      await gameContract.connect(player1).startGame();
      
      await expect(gameContract.connect(player2).completeGame(1, 1000, 50, 2))
        .to.be.revertedWith("Not your game session");
    });

    it("Should not allow completing game twice", async function () {
      const { gameContract, player1 } = await loadFixture(deployContractsFixture);
      
      await gameContract.connect(player1).registerPlayer("TestPlayer");
      await gameContract.connect(player1).startGame();
      await gameContract.connect(player1).completeGame(1, 1000, 50, 2);
      
      await expect(gameContract.connect(player1).completeGame(1, 1500, 75, 3))
        .to.be.revertedWith("Game already completed");
    });
  });

  describe("Leaderboard", function () {
    it("Should add player to leaderboard with qualifying score", async function () {
      const { gameContract, player1 } = await loadFixture(deployContractsFixture);
      
      await gameContract.connect(player1).registerPlayer("TestPlayer");
      await gameContract.connect(player1).startGame();
      
      const score = 1500; // Above MIN_SCORE_FOR_LEADERBOARD (100)
      await expect(gameContract.connect(player1).completeGame(1, score, 75, 3))
        .to.emit(gameContract, "LeaderboardUpdated")
        .withArgs(player1.address, score, 1);

      const leaderboard = await gameContract.getLeaderboard();
      expect(leaderboard.length).to.equal(1);
      expect(leaderboard[0].player).to.equal(player1.address);
      expect(leaderboard[0].score).to.equal(score);
      expect(leaderboard[0].username).to.equal("TestPlayer");
    });

    it("Should not add player to leaderboard with low score", async function () {
      const { gameContract, player1 } = await loadFixture(deployContractsFixture);
      
      await gameContract.connect(player1).registerPlayer("TestPlayer");
      await gameContract.connect(player1).startGame();
      
      const score = 50; // Below MIN_SCORE_FOR_LEADERBOARD (100)
      await gameContract.connect(player1).completeGame(1, score, 25, 1);

      const leaderboard = await gameContract.getLeaderboard();
      expect(leaderboard.length).to.equal(0);
    });

    it("Should maintain leaderboard order", async function () {
      const { gameContract, player1, player2, player3 } = await loadFixture(deployContractsFixture);
      
      // Register players
      await gameContract.connect(player1).registerPlayer("Player1");
      await gameContract.connect(player2).registerPlayer("Player2");
      await gameContract.connect(player3).registerPlayer("Player3");
      
      // Play games with different scores
      await gameContract.connect(player1).startGame();
      await gameContract.connect(player1).completeGame(1, 1000, 50, 2);
      
      await gameContract.connect(player2).startGame();
      await gameContract.connect(player2).completeGame(2, 2000, 100, 3);
      
      await gameContract.connect(player3).startGame();
      await gameContract.connect(player3).completeGame(3, 1500, 75, 2);
      
      const leaderboard = await gameContract.getLeaderboard();
      expect(leaderboard.length).to.equal(3);
      expect(leaderboard[0].score).to.equal(2000); // Highest score first
      expect(leaderboard[1].score).to.equal(1500);
      expect(leaderboard[2].score).to.equal(1000);
    });

    it("Should get player rank", async function () {
      const { gameContract, player1, player2 } = await loadFixture(deployContractsFixture);
      
      await gameContract.connect(player1).registerPlayer("Player1");
      await gameContract.connect(player2).registerPlayer("Player2");
      
      await gameContract.connect(player1).startGame();
      await gameContract.connect(player1).completeGame(1, 1000, 50, 2);
      
      await gameContract.connect(player2).startGame();
      await gameContract.connect(player2).completeGame(2, 2000, 100, 3);
      
      expect(await gameContract.getPlayerRank(player2.address)).to.equal(1);
      expect(await gameContract.getPlayerRank(player1.address)).to.equal(2);
    });
  });

  describe("Achievements and NFTs", function () {
    it("Should mint beginner achievement NFT", async function () {
      const { gameContract, nftContract, player1 } = await loadFixture(deployContractsFixture);

      await gameContract.connect(player1).registerPlayer("TestPlayer");
      await gameContract.connect(player1).startGame();

      const score = 1000; // BEGINNER_THRESHOLD
      await expect(gameContract.connect(player1).completeGame(1, score, 50, 2))
        .to.emit(gameContract, "AchievementUnlocked")
        .withArgs(player1.address, "BEGINNER");

      expect(await nftContract.hasAchievement(player1.address, "BEGINNER")).to.be.true;
      expect(await nftContract.balanceOf(player1.address)).to.equal(1);
    });

    it("Should mint pro achievement NFT", async function () {
      const { gameContract, nftContract, player1 } = await loadFixture(deployContractsFixture);

      await gameContract.connect(player1).registerPlayer("TestPlayer");
      await gameContract.connect(player1).startGame();

      const score = 5000; // PRO_THRESHOLD
      await gameContract.connect(player1).completeGame(1, score, 250, 4);

      expect(await nftContract.hasAchievement(player1.address, "PRO")).to.be.true;
      expect(await nftContract.hasAchievement(player1.address, "BEGINNER")).to.be.true;
      expect(await nftContract.balanceOf(player1.address)).to.equal(2);
    });

    it("Should mint master achievement NFT", async function () {
      const { gameContract, nftContract, player1 } = await loadFixture(deployContractsFixture);

      await gameContract.connect(player1).registerPlayer("TestPlayer");
      await gameContract.connect(player1).startGame();

      const score = 10000; // MASTER_THRESHOLD
      await gameContract.connect(player1).completeGame(1, score, 500, 5);

      expect(await nftContract.hasAchievement(player1.address, "MASTER")).to.be.true;
      expect(await nftContract.hasAchievement(player1.address, "PRO")).to.be.true;
      expect(await nftContract.hasAchievement(player1.address, "BEGINNER")).to.be.true;
      expect(await nftContract.balanceOf(player1.address)).to.equal(3);
    });

    it("Should not mint duplicate achievements", async function () {
      const { gameContract, nftContract, player1 } = await loadFixture(deployContractsFixture);

      await gameContract.connect(player1).registerPlayer("TestPlayer");

      // First game with beginner score
      await gameContract.connect(player1).startGame();
      await gameContract.connect(player1).completeGame(1, 1000, 50, 2);

      // Second game with beginner score again
      await gameContract.connect(player1).startGame();
      await gameContract.connect(player1).completeGame(2, 1200, 60, 2);

      expect(await nftContract.balanceOf(player1.address)).to.equal(1); // Only one NFT
    });

    it("Should get player achievements", async function () {
      const { gameContract, nftContract, player1 } = await loadFixture(deployContractsFixture);

      await gameContract.connect(player1).registerPlayer("TestPlayer");
      await gameContract.connect(player1).startGame();
      await gameContract.connect(player1).completeGame(1, 5000, 250, 4);

      const achievements = await nftContract.getPlayerAchievements(player1.address);
      expect(achievements.length).to.equal(2);
      expect(achievements).to.include("BEGINNER");
      expect(achievements).to.include("PRO");
    });
  });

  describe("Admin Functions", function () {
    it("Should pause and unpause contract", async function () {
      const { gameContract, owner, player1 } = await loadFixture(deployContractsFixture);

      await gameContract.connect(player1).registerPlayer("TestPlayer");

      // Pause contract
      await gameContract.connect(owner).pause();

      // Should not be able to start game when paused
      await expect(gameContract.connect(player1).startGame())
        .to.be.revertedWithCustomError(gameContract, "EnforcedPause");

      // Unpause contract
      await gameContract.connect(owner).unpause();

      // Should be able to start game after unpause
      await expect(gameContract.connect(player1).startGame())
        .to.emit(gameContract, "GameStarted");
    });

    it("Should clear leaderboard", async function () {
      const { gameContract, owner, player1 } = await loadFixture(deployContractsFixture);

      await gameContract.connect(player1).registerPlayer("TestPlayer");
      await gameContract.connect(player1).startGame();
      await gameContract.connect(player1).completeGame(1, 1000, 50, 2);

      expect((await gameContract.getLeaderboard()).length).to.equal(1);

      await gameContract.connect(owner).clearLeaderboard();

      expect((await gameContract.getLeaderboard()).length).to.equal(0);
    });

    it("Should get game statistics", async function () {
      const { gameContract, player1, player2 } = await loadFixture(deployContractsFixture);

      await gameContract.connect(player1).registerPlayer("Player1");
      await gameContract.connect(player2).registerPlayer("Player2");

      await gameContract.connect(player1).startGame();
      await gameContract.connect(player1).completeGame(1, 1000, 50, 2);

      const [totalPlayers, totalGames, leaderboardSize] = await gameContract.getGameStats();
      expect(totalPlayers).to.equal(2);
      expect(totalGames).to.equal(1);
      expect(leaderboardSize).to.equal(1);
    });
  });
});

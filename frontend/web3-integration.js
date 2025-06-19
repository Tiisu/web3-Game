// Web3 Integration for Whac-A-Mole Game

class Web3GameIntegration {
  constructor() {
    this.isInitialized = false;
    this.playerData = null;
    this.currentGameId = null;
    this.achievements = [];
    this.leaderboard = [];
  }

  // Initialize Web3 integration
  async initialize() {
    try {
      const success = await Web3Config.initWeb3();
      if (success) {
        this.isInitialized = true;
        await this.loadPlayerData();
        await this.loadAchievements();
        await this.loadLeaderboard();
        this.setupEventListeners();
        console.log('✅ Web3 integration initialized successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to initialize Web3 integration:', error);
      return false;
    }
  }

  // Register a new player
  async registerPlayer(username) {
    if (!this.isInitialized) throw new Error('Web3 not initialized');
    
    const gameContract = Web3Config.getGameContract();
    if (!gameContract) throw new Error('Game contract not available');

    try {
      const tx = await gameContract.registerPlayer(username);
      await tx.wait();
      
      // Reload player data
      await this.loadPlayerData();
      
      console.log(`✅ Player registered: ${username}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to register player:', error);
      throw error;
    }
  }

  // Start a new game session
  async startGameSession() {
    if (!this.isInitialized) throw new Error('Web3 not initialized');
    
    const gameContract = Web3Config.getGameContract();
    if (!gameContract) throw new Error('Game contract not available');

    try {
      const tx = await gameContract.startGame();
      const receipt = await tx.wait();
      
      // Extract game ID from event
      const gameStartedEvent = receipt.events?.find(e => e.event === 'GameStarted');
      if (gameStartedEvent) {
        this.currentGameId = gameStartedEvent.args.gameId.toNumber();
        console.log(`✅ Game session started: ${this.currentGameId}`);
        return this.currentGameId;
      }
      
      throw new Error('Failed to get game ID from transaction');
    } catch (error) {
      console.error('❌ Failed to start game session:', error);
      throw error;
    }
  }

  // Complete a game session
  async completeGameSession(score, molesHit, level) {
    if (!this.isInitialized) throw new Error('Web3 not initialized');
    if (!this.currentGameId) throw new Error('No active game session');
    
    const gameContract = Web3Config.getGameContract();
    if (!gameContract) throw new Error('Game contract not available');

    try {
      const tx = await gameContract.completeGame(
        this.currentGameId,
        score,
        molesHit,
        level
      );
      await tx.wait();
      
      // Reload data
      await this.loadPlayerData();
      await this.loadAchievements();
      await this.loadLeaderboard();
      
      this.currentGameId = null;
      console.log(`✅ Game session completed: Score ${score}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to complete game session:', error);
      throw error;
    }
  }

  // Load player data from blockchain
  async loadPlayerData() {
    if (!this.isInitialized) return;
    
    const gameContract = Web3Config.getGameContract();
    const account = Web3Config.getCurrentAccount();
    
    if (!gameContract || !account) return;

    try {
      const playerData = await gameContract.getPlayer(account);
      this.playerData = {
        address: playerData.playerAddress,
        username: playerData.username,
        totalGamesPlayed: playerData.totalGamesPlayed.toNumber(),
        totalScore: playerData.totalScore.toNumber(),
        highestScore: playerData.highestScore.toNumber(),
        totalMolesHit: playerData.totalMolesHit.toNumber(),
        registrationTime: new Date(playerData.registrationTime.toNumber() * 1000),
        isRegistered: playerData.isRegistered
      };
      
      console.log('📊 Player data loaded:', this.playerData);
    } catch (error) {
      console.error('❌ Failed to load player data:', error);
    }
  }

  // Load player achievements
  async loadAchievements() {
    if (!this.isInitialized) return;
    
    const nftContract = Web3Config.getNFTContract();
    const account = Web3Config.getCurrentAccount();
    
    if (!nftContract || !account) return;

    try {
      const achievements = await nftContract.getPlayerAchievements(account);
      this.achievements = achievements;
      console.log('🏆 Achievements loaded:', achievements);
    } catch (error) {
      console.error('❌ Failed to load achievements:', error);
    }
  }

  // Load leaderboard
  async loadLeaderboard() {
    if (!this.isInitialized) return;
    
    const gameContract = Web3Config.getGameContract();
    if (!gameContract) return;

    try {
      const leaderboardData = await gameContract.getLeaderboard();
      this.leaderboard = leaderboardData.map(entry => ({
        player: entry.player,
        username: entry.username,
        score: entry.score.toNumber(),
        timestamp: new Date(entry.timestamp.toNumber() * 1000)
      }));
      
      console.log('📋 Leaderboard loaded:', this.leaderboard);
    } catch (error) {
      console.error('❌ Failed to load leaderboard:', error);
    }
  }

  // Get player rank
  async getPlayerRank() {
    if (!this.isInitialized) return 0;
    
    const gameContract = Web3Config.getGameContract();
    const account = Web3Config.getCurrentAccount();
    
    if (!gameContract || !account) return 0;

    try {
      const rank = await gameContract.getPlayerRank(account);
      return rank.toNumber();
    } catch (error) {
      console.error('❌ Failed to get player rank:', error);
      return 0;
    }
  }

  // Update username
  async updateUsername(newUsername) {
    if (!this.isInitialized) throw new Error('Web3 not initialized');
    
    const gameContract = Web3Config.getGameContract();
    if (!gameContract) throw new Error('Game contract not available');

    try {
      const tx = await gameContract.updateUsername(newUsername);
      await tx.wait();
      
      await this.loadPlayerData();
      console.log(`✅ Username updated: ${newUsername}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to update username:', error);
      throw error;
    }
  }

  // Setup event listeners for contract events
  setupEventListeners() {
    const gameContract = Web3Config.getGameContract();
    if (!gameContract) return;

    // Listen for achievement unlocks
    gameContract.on('AchievementUnlocked', (player, achievement, event) => {
      if (player.toLowerCase() === Web3Config.getCurrentAccount()?.toLowerCase()) {
        this.showAchievementNotification(achievement);
        this.loadAchievements(); // Reload achievements
      }
    });

    // Listen for leaderboard updates
    gameContract.on('LeaderboardUpdated', (player, score, position, event) => {
      this.loadLeaderboard(); // Reload leaderboard
      
      if (player.toLowerCase() === Web3Config.getCurrentAccount()?.toLowerCase()) {
        this.showLeaderboardNotification(position.toNumber(), score.toNumber());
      }
    });
  }

  // Show achievement notification
  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-content">
        <span class="achievement-icon">🏆</span>
        <div class="achievement-text">
          <div class="achievement-title">Achievement Unlocked!</div>
          <div class="achievement-name">${achievement}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 1000);
    }, 5000);
  }

  // Show leaderboard notification
  showLeaderboardNotification(position, score) {
    const notification = document.createElement('div');
    notification.className = 'leaderboard-notification';
    notification.innerHTML = `
      <div class="leaderboard-content">
        <span class="leaderboard-icon">📋</span>
        <div class="leaderboard-text">
          <div class="leaderboard-title">Leaderboard Updated!</div>
          <div class="leaderboard-info">Rank #${position} with ${score} points</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 1000);
    }, 4000);
  }

  // Getters for UI integration
  getPlayerData() { return this.playerData; }
  getAchievements() { return this.achievements; }
  getLeaderboard() { return this.leaderboard; }
  isPlayerRegistered() { return this.playerData?.isRegistered || false; }
  getCurrentGameId() { return this.currentGameId; }
}

// Create global instance
window.web3Game = new Web3GameIntegration();

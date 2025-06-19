let currMoleTile1, currMoleTile2;
let currPlantTile;
let score = 0;
let gameOver = false;
let isPaused = false;

// Level system variables
let currentLevel = 1;
let maxLevel = 5;
let pointsToNextLevel = 1000;
let basePointsToNextLevel = 1000;

let moleIntervalTime = 1000;
let plantIntervalTime = 2000;

let moleInterval, plantInterval, difficultyInterval;
let timeLeft = 120;
let timerInterval;
let backgroundMusic;

// Game statistics
let gameStats = {
    gamesPlayed: 0,
    totalScore: 0,
    bestTime: 0,
    molesHit: 0,
    totalCoins: 0,
    highestLevel: 1
};

// Load game stats from localStorage
function loadGameStats() {
    const savedStats = localStorage.getItem('gameStats');
    if (savedStats) {
        gameStats = JSON.parse(savedStats);
        updateDashboard();
    }
}

// Save game stats to localStorage
function saveGameStats() {
    localStorage.setItem('gameStats', JSON.stringify(gameStats));
    updateDashboard();
}

// Update dashboard display
function updateDashboard() {
    document.getElementById('games-played').textContent = gameStats.gamesPlayed;
    document.getElementById('avg-score').textContent = 
        gameStats.gamesPlayed > 0 ? Math.round(gameStats.totalScore / gameStats.gamesPlayed) : 0;
    document.getElementById('best-time').textContent = gameStats.bestTime + 's';
    document.getElementById('total-moles').textContent = gameStats.molesHit;
    document.getElementById('total-coins').textContent = gameStats.totalCoins;
    
    // Add highest level reached to dashboard if it exists
    if (document.getElementById('highest-level')) {
        document.getElementById('highest-level').textContent = gameStats.highestLevel;
    }
}

// Update leaderboard
function updateLeaderboard(newScore) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    leaderboard.push(newScore);
    leaderboard.sort((a, b) => b - a);
    leaderboard = leaderboard.slice(0, 5); // Keep only top 5 scores
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '';
    leaderboard.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${score} points`;
        leaderboardElement.appendChild(li);
    });
}

// Check and update achievements
function checkAchievements() {
    const achievements = {
        beginner: { score: 1000, element: 'beginner' },
        pro: { score: 5000, element: 'pro' },
        master: { score: 10000, element: 'master' }
    };

    Object.entries(achievements).forEach(([key, achievement]) => {
        const element = document.getElementById(achievement.element);
        if (score >= achievement.score && element.classList.contains('locked')) {
            element.classList.remove('locked');
            element.classList.add('unlocked');
            playSound('achievement-sound');
        }
    });
}

// Level system functions
function updateLevelDisplay() {
    document.getElementById("level").textContent = currentLevel;
    document.getElementById("next-level-progress").textContent = `${Math.min(score, pointsToNextLevel)}/${pointsToNextLevel}`;
    
    // Update progress bar
    const progressPercentage = Math.min(100, (score % pointsToNextLevel) / pointsToNextLevel * 100);
    document.getElementById("level-progress-bar").style.width = `${progressPercentage}%`;
}

function checkLevelUp() {
    if (currentLevel < maxLevel && score >= pointsToNextLevel) {
        currentLevel++;
        
        // Play level up sound
        playSound('level-up-sound');
        
        // Update the points required for next level (increases with each level)
        pointsToNextLevel = Math.floor(basePointsToNextLevel * (currentLevel * 1.5));
        
        // Apply level effects
        applyLevelEffects();
        
        // Show level up notification
        showLevelUpNotification();
        
        // Update highest level in stats if needed
        if (currentLevel > gameStats.highestLevel) {
            gameStats.highestLevel = currentLevel;
            saveGameStats();
        }
        
        // Update level display
        updateLevelDisplay();
    }
}

function applyLevelEffects() {
    // Adjust game difficulty based on level
    switch(currentLevel) {
        case 2:
            // Level 2: Faster moles
            moleIntervalTime = 900;
            break;
        case 3:
            // Level 3: Even faster moles and plants
            moleIntervalTime = 800;
            plantIntervalTime = 1800;
            break;
        case 4:
            // Level 4: More challenging
            moleIntervalTime = 700;
            plantIntervalTime = 1600;
            break;
        case 5:
            // Level 5: Expert mode
            moleIntervalTime = 600;
            plantIntervalTime = 1400;
            break;
    }
    
    // Apply the new intervals
    startIntervals();
}

function showLevelUpNotification() {
    // Create level up notification
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `
        <span class="level-icon">🎮</span>
        <span class="level-text">Level Up! You're now Level ${currentLevel}</span>
    `;
    document.body.appendChild(notification);
    
    // Remove notification after animation
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 1000);
    }, 2000);
}

window.onload = async function() {
    // Initialize Web3 first
    await initializeWeb3();

    // Initialize game controls
    document.getElementById("start-btn").addEventListener("click", startGame);
    document.getElementById("pause-btn").addEventListener("click", pauseGame);
    document.getElementById("resume-btn").addEventListener("click", resumeGame);
    document.getElementById("stop-btn").addEventListener("click", stopGame);

    document.getElementById("highScore").innerText = localStorage.getItem("highScore") || 0;

    // Initialize dashboard
    loadGameStats();
    updateLeaderboard(0);

    // Initialize button states
    document.getElementById("pause-btn").disabled = true;
    document.getElementById("resume-btn").disabled = true;
    document.getElementById("stop-btn").disabled = true;

    // Initialize background music
    backgroundMusic = document.getElementById("background-music");
    backgroundMusic.volume = 0.5; // Set music volume to 50%

    // Initialize level display
    updateLevelDisplay();

    // Setup Web3 event listeners
    setupWeb3EventListeners();
};

// Initialize Web3 integration
async function initializeWeb3() {
    try {
        const success = await web3Game.initialize();
        if (success) {
            console.log('✅ Web3 initialized successfully');
            updateWeb3UI();
        } else {
            console.log('⚠️ Web3 initialization failed - running in local mode');
        }
    } catch (error) {
        console.error('❌ Web3 initialization error:', error);
    }
}

// Setup Web3 event listeners
function setupWeb3EventListeners() {
    // Connect wallet button
    const connectBtn = document.getElementById('connect-wallet-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', async () => {
            try {
                const success = await web3Game.initialize();
                if (success) {
                    updateWeb3UI();
                    checkPlayerRegistration();
                }
            } catch (error) {
                console.error('Failed to connect wallet:', error);
                alert('Failed to connect wallet. Please make sure MetaMask is installed and try again.');
            }
        });
    }

    // Register player button
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            const username = document.getElementById('username-input').value.trim();
            if (!username) {
                showRegistrationStatus('Please enter a username', 'error');
                return;
            }

            try {
                registerBtn.disabled = true;
                showRegistrationStatus('Registering player...', 'info');

                await web3Game.registerPlayer(username);
                showRegistrationStatus('Player registered successfully!', 'success');

                setTimeout(() => {
                    document.getElementById('registration-modal').style.display = 'none';
                    updateWeb3UI();
                }, 2000);
            } catch (error) {
                console.error('Registration failed:', error);
                showRegistrationStatus('Registration failed: ' + error.message, 'error');
                registerBtn.disabled = false;
            }
        });
    }

    // Refresh leaderboard button
    const refreshBtn = document.getElementById('refresh-leaderboard-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            await refreshWeb3Data();
        });
    }

    // Edit username button
    const editUsernameBtn = document.getElementById('edit-username-btn');
    if (editUsernameBtn) {
        editUsernameBtn.addEventListener('click', () => {
            const newUsername = prompt('Enter new username:');
            if (newUsername && newUsername.trim()) {
                updatePlayerUsername(newUsername.trim());
            }
        });
    }
}

async function startGame() {
    if (!gameOver) {
        // Check if player is registered for Web3 features
        if (web3Game.isInitialized && !web3Game.isPlayerRegistered()) {
            alert('Please register your player profile first to earn achievements and compete on the leaderboard!');
            checkPlayerRegistration();
            return;
        }

        score = 0;
        timeLeft = 120;
        currentLevel = 1;
        pointsToNextLevel = basePointsToNextLevel;

        updateTimerDisplay();
        updateScore();
        updateLevelDisplay();

        setGame();
        document.getElementById("start-btn").disabled = true;
        document.getElementById("pause-btn").disabled = false;
        document.getElementById("resume-btn").disabled = true;
        document.getElementById("stop-btn").disabled = false;

        startTimer();

        // Start background music
        playBackgroundMusic();

        // Start Web3 game session if available
        if (web3Game.isInitialized && web3Game.isPlayerRegistered()) {
            try {
                await web3Game.startGameSession();
                console.log('🎮 Web3 game session started');
            } catch (error) {
                console.error('Failed to start Web3 game session:', error);
            }
        }
    }
}

// Play background music function
function playBackgroundMusic() {
    backgroundMusic.play().catch(error => {
        console.log("Audio play failed:", error);
    });
}

// Pause background music function
function pauseBackgroundMusic() {
    backgroundMusic.pause();
}

function pauseGame() {
    if (!gameOver && !isPaused) {
        isPaused = true;
        clearInterval(moleInterval);
        clearInterval(plantInterval);
        clearInterval(difficultyInterval);
        clearInterval(timerInterval);
        document.getElementById("pause-btn").disabled = true;
        document.getElementById("resume-btn").disabled = false;
        
        // Pause background music
        pauseBackgroundMusic();
    }
}

function resumeGame() {
    if (!gameOver && isPaused) {
        isPaused = false;
        startIntervals();
        startTimer();
        difficultyInterval = setInterval(increaseDifficulty, 30000);
        document.getElementById("pause-btn").disabled = false;
        document.getElementById("resume-btn").disabled = true;
        
        // Resume background music
        playBackgroundMusic();
    }
}

async function stopGame() {
    gameOver = true;
    clearInterval(moleInterval);
    clearInterval(plantInterval);
    clearInterval(difficultyInterval);
    clearInterval(timerInterval);

    // Stop background music
    pauseBackgroundMusic();

    // Play game over sound
    playSound("gameover-sound");

    // Complete Web3 game session if available
    if (web3Game.isInitialized && web3Game.isPlayerRegistered() && web3Game.getCurrentGameId()) {
        try {
            await web3Game.completeGameSession(score, gameStats.molesHit, currentLevel);
            console.log('🏆 Web3 game session completed');

            // Update Web3 UI with new data
            setTimeout(() => updateWeb3UI(), 1000);
        } catch (error) {
            console.error('Failed to complete Web3 game session:', error);
        }
    }

    // Update local game statistics
    gameStats.gamesPlayed++;
    gameStats.totalScore += score;
    gameStats.totalCoins += score;
    const timePlayed = 120 - timeLeft;
    if (timePlayed > gameStats.bestTime) {
        gameStats.bestTime = timePlayed;
    }
    if (currentLevel > gameStats.highestLevel) {
        gameStats.highestLevel = currentLevel;
    }
    saveGameStats();

    // Update local leaderboard (for fallback)
    updateLeaderboard(score);

    // Show toast with simplified message
    const toast = document.getElementById("toast");
    const web3Status = web3Game.isInitialized && web3Game.isPlayerRegistered() ?
        '<div style="font-size: 0.9rem; color: #4CAF50;">✅ Saved to ApeChain</div>' :
        '<div style="font-size: 0.9rem; color: #ff9800;">⚠️ Local game only</div>';

    toast.innerHTML = `<div style="font-size: 1.5rem; margin-bottom: 10px;">GAME OVER!</div>
                      <div>Final Score: ${score}</div>
                      ${web3Status}`;
    toast.className = "toast show";

    // Hide toast after 4 seconds and reload
    setTimeout(() => {
        toast.className = "toast";
        location.reload();
    }, 4000);
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timeLeft > 0 && !gameOver && !isPaused) {
            timeLeft--;
            updateTimerDisplay();
        } else if (timeLeft === 0) {
            clearInterval(timerInterval);
            stopGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById("time").innerText = timeLeft;
}

function setGame() {
    let board = document.getElementById("board");
    board.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        let tile = document.createElement("div");
        tile.id = i.toString();
        tile.addEventListener("click", selectTile);
        board.appendChild(tile);
    }

    startIntervals();
    difficultyInterval = setInterval(increaseDifficulty, 30000);
}

function startIntervals() {
    clearInterval(moleInterval);
    clearInterval(plantInterval);

    moleInterval = setInterval(setMoles, moleIntervalTime);
    plantInterval = setInterval(setPlant, plantIntervalTime);
}

function getRandomTile(excludeTiles = []) {
    let availableTiles = [...Array(9).keys()].map(String).filter(tile => !excludeTiles.includes(tile));
    return availableTiles.length ? availableTiles[Math.floor(Math.random() * availableTiles.length)] : null;
}

function setMoles() {
    if (gameOver || isPaused) return;

    if (currMoleTile1) currMoleTile1.innerHTML = "";
    if (currMoleTile2) currMoleTile2.innerHTML = "";

    let mole1 = document.createElement("img");
    mole1.src = "./images/mole-3.png";
    mole1.draggable = false;
    mole1.classList.add("mole");

    let mole2 = document.createElement("img");
    mole2.src = "./images/mole-2.png";
    mole2.draggable = false;
    mole2.classList.add("mole");

    let tile1 = getRandomTile(currPlantTile ? [currPlantTile.id] : []);
    let tile2 = getRandomTile([tile1, currPlantTile ? currPlantTile.id : ""]);

    if (!tile1 || !tile2) return;

    currMoleTile1 = document.getElementById(tile1);
    currMoleTile2 = document.getElementById(tile2);

    currMoleTile1.appendChild(mole1);
    currMoleTile2.appendChild(mole2);
}

function setPlant() {
    if (gameOver || isPaused) return;

    if (currPlantTile) currPlantTile.innerHTML = "";

    let plant = document.createElement("img");
    plant.src = "./images/fanbase.png";
    plant.draggable = false;
    plant.classList.add("piranha");
    plant.style.width = "110px";

    let tile = getRandomTile([currMoleTile1?.id, currMoleTile2?.id]);

    if (!tile) return;

    currPlantTile = document.getElementById(tile);
    currPlantTile.appendChild(plant);
}

function selectTile() {
    if (gameOver || isPaused) return;

    if (this === currMoleTile1 || this === currMoleTile2) {
        let moleImg = this.querySelector("img");
        
        // Base score values
        let pointsEarned = 0;
        
        if (moleImg && moleImg.src.includes("images/mole-3.png")) {
            pointsEarned = 20;
        } else if (moleImg && moleImg.src.includes("images/mole-2.png")) {
            pointsEarned = 10;
        }
        
        // Apply level multiplier (higher levels give more points)
        pointsEarned = Math.floor(pointsEarned * (1 + (currentLevel - 1) * 0.2));
        
        score += pointsEarned;
        
        // Show points earned
        showPointsEarned(this, pointsEarned);

        gameStats.molesHit++;
        playSound("mole-sound");
        updateScore();
        checkAchievements();
        
        // Check for level up
        checkLevelUp();
    } else if (this === currPlantTile) {
        playSound("plant-sound");
        stopGame();
    }
}

function showPointsEarned(tile, points) {
    // Create floating points element
    const pointsElement = document.createElement('div');
    pointsElement.className = 'points-earned';
    pointsElement.textContent = `+${points}`;
    
    // Position relative to the clicked tile
    const tileRect = tile.getBoundingClientRect();
    pointsElement.style.left = `${tileRect.left + tileRect.width/2}px`;
    pointsElement.style.top = `${tileRect.top}px`;
    
    // Add to document and animate
    document.body.appendChild(pointsElement);
    
    // Remove after animation
    setTimeout(() => {
        pointsElement.remove();
    }, 1000);
}

function playSound(id) {
    let sound = document.getElementById(id);
    if (sound) {
        sound.currentTime = 0;
        sound.play();
    }
}

function updateScore() {
    document.getElementById("score").innerText = score;

    let highScore = localStorage.getItem("highScore") || 0;
    if (score > highScore) {
        localStorage.setItem("highScore", score);
        document.getElementById("highScore").innerText = score;
    }
}
  
function increaseDifficulty() {
    if (gameOver || isPaused) return;

    // Base difficulty increase
    moleIntervalTime = Math.max(300, moleIntervalTime - 50);
    plantIntervalTime = Math.max(800, plantIntervalTime - 50);

    startIntervals();
}

// Web3 Integration Helper Functions

// Update Web3 UI elements
function updateWeb3UI() {
    Web3Config.updateUI();

    const playerData = web3Game.getPlayerData();
    const achievements = web3Game.getAchievements();
    const leaderboard = web3Game.getLeaderboard();

    // Update player info
    if (playerData && playerData.isRegistered) {
        const playerInfo = document.getElementById('web3-player-info');
        const playerUsername = document.getElementById('player-username');
        const playerRank = document.getElementById('player-rank');

        if (playerInfo) playerInfo.style.display = 'block';
        if (playerUsername) playerUsername.textContent = playerData.username;

        // Update rank
        web3Game.getPlayerRank().then(rank => {
            if (playerRank) playerRank.textContent = rank || '-';
        });

        // Update stats with blockchain data
        updateStatsWithWeb3Data(playerData);
    }

    // Update achievements
    updateAchievementsUI(achievements);

    // Update leaderboard
    updateLeaderboardUI(leaderboard);
}

// Update stats with Web3 data
function updateStatsWithWeb3Data(playerData) {
    if (!playerData) return;

    document.getElementById('games-played').textContent = playerData.totalGamesPlayed;
    document.getElementById('total-score').textContent = playerData.totalScore;
    document.getElementById('highest-score').textContent = playerData.highestScore;
    document.getElementById('total-moles').textContent = playerData.totalMolesHit;

    // Update NFT count
    const nftCount = web3Game.getAchievements().length;
    document.getElementById('nft-count').textContent = nftCount;

    // Calculate average score
    const avgScore = playerData.totalGamesPlayed > 0 ?
        Math.round(playerData.totalScore / playerData.totalGamesPlayed) : 0;
    document.getElementById('avg-score').textContent = avgScore;
}

// Update achievements UI
function updateAchievementsUI(achievements) {
    const achievementElements = document.querySelectorAll('.achievement[data-achievement]');

    achievementElements.forEach(element => {
        const achievementType = element.getAttribute('data-achievement');
        const isUnlocked = achievements.includes(achievementType);

        if (isUnlocked) {
            element.classList.remove('locked');
            element.classList.add('unlocked');
            const nftBadge = element.querySelector('.nft-badge');
            if (nftBadge) nftBadge.style.display = 'inline-block';
        }
    });
}

// Update leaderboard UI
function updateLeaderboardUI(leaderboard) {
    const leaderboardElement = document.getElementById('leaderboard');
    if (!leaderboardElement || !leaderboard) return;

    leaderboardElement.innerHTML = '';

    leaderboard.slice(0, 10).forEach((entry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="leaderboard-entry">
                <span class="rank">#${index + 1}</span>
                <span class="username">${entry.username}</span>
                <span class="score">${entry.score}</span>
            </div>
        `;
        leaderboardElement.appendChild(li);
    });
}

// Check if player needs to register
function checkPlayerRegistration() {
    if (web3Game.isInitialized && !web3Game.isPlayerRegistered()) {
        document.getElementById('registration-modal').style.display = 'flex';
    }
}

// Show registration status
function showRegistrationStatus(message, type) {
    const statusElement = document.getElementById('registration-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
    }
}

// Update player username
async function updatePlayerUsername(newUsername) {
    try {
        await web3Game.updateUsername(newUsername);
        updateWeb3UI();
        alert('Username updated successfully!');
    } catch (error) {
        console.error('Failed to update username:', error);
        alert('Failed to update username: ' + error.message);
    }
}

// Refresh Web3 data
async function refreshWeb3Data() {
    if (!web3Game.isInitialized) return;

    const loadingElement = document.getElementById('leaderboard-loading');
    if (loadingElement) loadingElement.style.display = 'block';

    try {
        await web3Game.loadPlayerData();
        await web3Game.loadAchievements();
        await web3Game.loadLeaderboard();
        updateWeb3UI();
    } catch (error) {
        console.error('Failed to refresh Web3 data:', error);
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}





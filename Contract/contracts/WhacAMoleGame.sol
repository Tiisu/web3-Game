// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./WhacAMoleNFT.sol";

/**
 * @title WhacAMoleGame
 * @dev Main game contract for Web3 Whac-A-Mole on Ape Chain
 */
contract WhacAMoleGame is Ownable, ReentrancyGuard, Pausable {
    
    // Game configuration
    uint256 public constant GAME_DURATION = 120; // 2 minutes in seconds
    uint256 public constant MIN_SCORE_FOR_LEADERBOARD = 100;
    uint256 public constant MAX_LEADERBOARD_SIZE = 100;
    
    // Achievement thresholds
    uint256 public constant BEGINNER_THRESHOLD = 1000;
    uint256 public constant PRO_THRESHOLD = 5000;
    uint256 public constant MASTER_THRESHOLD = 10000;
    
    // Structs
    struct Player {
        address playerAddress;
        string username;
        uint256 totalGamesPlayed;
        uint256 totalScore;
        uint256 highestScore;
        uint256 totalMolesHit;
        uint256 registrationTime;
        bool isRegistered;
    }
    
    struct GameSession {
        address player;
        uint256 score;
        uint256 molesHit;
        uint256 level;
        uint256 startTime;
        uint256 endTime;
        bool isCompleted;
    }
    
    struct LeaderboardEntry {
        address player;
        string username;
        uint256 score;
        uint256 timestamp;
    }
    
    // State variables
    WhacAMoleNFT public nftContract;
    
    mapping(address => Player) public players;
    mapping(uint256 => GameSession) public gameSessions;
    mapping(address => uint256[]) public playerGameSessions;
    
    LeaderboardEntry[] public leaderboard;
    
    uint256 public nextGameId = 1;
    uint256 public totalPlayersRegistered;
    uint256 public totalGamesPlayed;
    
    // Events
    event PlayerRegistered(address indexed player, string username);
    event GameStarted(address indexed player, uint256 indexed gameId);
    event GameCompleted(address indexed player, uint256 indexed gameId, uint256 score);
    event LeaderboardUpdated(address indexed player, uint256 score, uint256 position);
    event AchievementUnlocked(address indexed player, string achievement);
    
    constructor(address initialOwner) Ownable(initialOwner) {
        // NFT contract will be set after deployment
    }
    
    /**
     * @dev Set the NFT contract address (only owner)
     */
    function setNFTContract(address _nftContract) external onlyOwner {
        nftContract = WhacAMoleNFT(_nftContract);
    }
    
    /**
     * @dev Register a new player
     */
    function registerPlayer(string memory _username) external {
        require(!players[msg.sender].isRegistered, "Player already registered");
        require(bytes(_username).length > 0 && bytes(_username).length <= 32, "Invalid username length");
        
        players[msg.sender] = Player({
            playerAddress: msg.sender,
            username: _username,
            totalGamesPlayed: 0,
            totalScore: 0,
            highestScore: 0,
            totalMolesHit: 0,
            registrationTime: block.timestamp,
            isRegistered: true
        });
        
        totalPlayersRegistered++;
        emit PlayerRegistered(msg.sender, _username);
    }
    
    /**
     * @dev Start a new game session
     */
    function startGame() external whenNotPaused nonReentrant returns (uint256) {
        require(players[msg.sender].isRegistered, "Player not registered");
        
        uint256 gameId = nextGameId++;
        
        gameSessions[gameId] = GameSession({
            player: msg.sender,
            score: 0,
            molesHit: 0,
            level: 1,
            startTime: block.timestamp,
            endTime: 0,
            isCompleted: false
        });
        
        playerGameSessions[msg.sender].push(gameId);
        
        emit GameStarted(msg.sender, gameId);
        return gameId;
    }
    
    /**
     * @dev Complete a game session and record the score
     */
    function completeGame(
        uint256 _gameId,
        uint256 _score,
        uint256 _molesHit,
        uint256 _level
    ) external whenNotPaused nonReentrant {
        GameSession storage session = gameSessions[_gameId];
        require(session.player == msg.sender, "Not your game session");
        require(!session.isCompleted, "Game already completed");
        require(block.timestamp >= session.startTime, "Game not started");
        
        // Complete the game session
        session.score = _score;
        session.molesHit = _molesHit;
        session.level = _level;
        session.endTime = block.timestamp;
        session.isCompleted = true;
        
        // Update player stats
        Player storage player = players[msg.sender];
        player.totalGamesPlayed++;
        player.totalScore += _score;
        player.totalMolesHit += _molesHit;
        
        if (_score > player.highestScore) {
            player.highestScore = _score;
        }
        
        totalGamesPlayed++;
        
        // Update leaderboard if score qualifies
        if (_score >= MIN_SCORE_FOR_LEADERBOARD) {
            _updateLeaderboard(msg.sender, _score);
        }
        
        // Check for achievements
        _checkAndMintAchievements(msg.sender, _score);
        
        emit GameCompleted(msg.sender, _gameId, _score);
    }
    
    /**
     * @dev Update the leaderboard with a new score
     */
    function _updateLeaderboard(address _player, uint256 _score) internal {
        string memory username = players[_player].username;
        
        // Check if player already exists in leaderboard
        int256 existingIndex = -1;
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].player == _player) {
                existingIndex = int256(i);
                break;
            }
        }
        
        // If player exists and new score is not higher, return
        if (existingIndex >= 0 && leaderboard[uint256(existingIndex)].score >= _score) {
            return;
        }
        
        // Remove existing entry if found
        if (existingIndex >= 0) {
            for (uint256 i = uint256(existingIndex); i < leaderboard.length - 1; i++) {
                leaderboard[i] = leaderboard[i + 1];
            }
            leaderboard.pop();
        }
        
        // Find insertion position
        uint256 insertPosition = leaderboard.length;
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (_score > leaderboard[i].score) {
                insertPosition = i;
                break;
            }
        }
        
        // Insert new entry
        leaderboard.push(LeaderboardEntry({
            player: _player,
            username: username,
            score: _score,
            timestamp: block.timestamp
        }));
        
        // Move entries to make space
        for (uint256 i = leaderboard.length - 1; i > insertPosition; i--) {
            leaderboard[i] = leaderboard[i - 1];
        }
        
        // Insert at correct position
        leaderboard[insertPosition] = LeaderboardEntry({
            player: _player,
            username: username,
            score: _score,
            timestamp: block.timestamp
        });
        
        // Trim leaderboard if too long
        if (leaderboard.length > MAX_LEADERBOARD_SIZE) {
            leaderboard.pop();
        }
        
        emit LeaderboardUpdated(_player, _score, insertPosition + 1);
    }
    
    /**
     * @dev Check achievements and mint NFTs
     */
    function _checkAndMintAchievements(address _player, uint256 _score) internal {
        if (address(nftContract) == address(0)) return;

        // Check for score-based achievements (check all that apply)
        if (_score >= BEGINNER_THRESHOLD && !nftContract.hasAchievement(_player, "BEGINNER")) {
            nftContract.mintAchievement(_player, "BEGINNER", "Beginner: Scored 1,000+ points");
            emit AchievementUnlocked(_player, "BEGINNER");
        }

        if (_score >= PRO_THRESHOLD && !nftContract.hasAchievement(_player, "PRO")) {
            nftContract.mintAchievement(_player, "PRO", "Pro Player: Scored 5,000+ points");
            emit AchievementUnlocked(_player, "PRO");
        }

        if (_score >= MASTER_THRESHOLD && !nftContract.hasAchievement(_player, "MASTER")) {
            nftContract.mintAchievement(_player, "MASTER", "Master Player: Scored 10,000+ points");
            emit AchievementUnlocked(_player, "MASTER");
        }

        // Check for games played achievements
        Player memory player = players[_player];
        if (player.totalGamesPlayed >= 10 && !nftContract.hasAchievement(_player, "REGULAR")) {
            nftContract.mintAchievement(_player, "REGULAR", "Regular Player: Played 10+ games");
            emit AchievementUnlocked(_player, "REGULAR");
        }

        if (player.totalGamesPlayed >= 100 && !nftContract.hasAchievement(_player, "VETERAN")) {
            nftContract.mintAchievement(_player, "VETERAN", "Veteran: Played 100+ games");
            emit AchievementUnlocked(_player, "VETERAN");
        }
    }

    // View functions

    /**
     * @dev Get player information
     */
    function getPlayer(address _player) external view returns (Player memory) {
        return players[_player];
    }

    /**
     * @dev Get game session information
     */
    function getGameSession(uint256 _gameId) external view returns (GameSession memory) {
        return gameSessions[_gameId];
    }

    /**
     * @dev Get player's game sessions
     */
    function getPlayerGameSessions(address _player) external view returns (uint256[] memory) {
        return playerGameSessions[_player];
    }

    /**
     * @dev Get leaderboard
     */
    function getLeaderboard() external view returns (LeaderboardEntry[] memory) {
        return leaderboard;
    }

    /**
     * @dev Get leaderboard with pagination
     */
    function getLeaderboardPaginated(uint256 _offset, uint256 _limit)
        external
        view
        returns (LeaderboardEntry[] memory)
    {
        require(_offset < leaderboard.length, "Offset out of bounds");

        uint256 end = _offset + _limit;
        if (end > leaderboard.length) {
            end = leaderboard.length;
        }

        LeaderboardEntry[] memory result = new LeaderboardEntry[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = leaderboard[i];
        }

        return result;
    }

    /**
     * @dev Get player's rank on leaderboard
     */
    function getPlayerRank(address _player) external view returns (uint256) {
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].player == _player) {
                return i + 1; // 1-based ranking
            }
        }
        return 0; // Not on leaderboard
    }

    /**
     * @dev Get game statistics
     */
    function getGameStats() external view returns (
        uint256 totalPlayers,
        uint256 totalGames,
        uint256 leaderboardSize
    ) {
        return (totalPlayersRegistered, totalGamesPlayed, leaderboard.length);
    }

    // Admin functions

    /**
     * @dev Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency function to clear leaderboard (only owner)
     */
    function clearLeaderboard() external onlyOwner {
        delete leaderboard;
    }

    /**
     * @dev Update player username (only the player themselves)
     */
    function updateUsername(string memory _newUsername) external {
        require(players[msg.sender].isRegistered, "Player not registered");
        require(bytes(_newUsername).length > 0 && bytes(_newUsername).length <= 32, "Invalid username length");

        players[msg.sender].username = _newUsername;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title WhacAMoleNFT
 * @dev NFT contract for Whac-A-Mole achievements
 */
contract WhacAMoleNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;
    
    // Achievement types
    mapping(string => bool) public validAchievements;
    
    // Player achievements: player => achievement => hasAchievement
    mapping(address => mapping(string => bool)) public playerAchievements;
    
    // Achievement metadata: achievement => metadata
    mapping(string => AchievementMetadata) public achievementMetadata;
    
    // Token ID to achievement mapping
    mapping(uint256 => string) public tokenAchievement;
    
    struct AchievementMetadata {
        string name;
        string description;
        string imageURI;
        uint256 totalMinted;
        bool exists;
    }
    
    uint256 private _nextTokenId = 1;
    address public gameContract;
    string private _baseTokenURI;
    
    // Events
    event AchievementMinted(address indexed player, string achievement, uint256 tokenId);
    event AchievementTypeAdded(string achievement, string name, string description);
    
    constructor(
        address initialOwner,
        string memory baseURI
    ) ERC721("Whac-A-Mole Achievements", "WAMA") Ownable(initialOwner) {
        _baseTokenURI = baseURI;
        _initializeAchievements();
    }
    
    /**
     * @dev Initialize default achievements
     */
    function _initializeAchievements() internal {
        _addAchievementType("BEGINNER", "Beginner", "Score 1,000+ points in a single game");
        _addAchievementType("PRO", "Pro Player", "Score 5,000+ points in a single game");
        _addAchievementType("MASTER", "Master", "Score 10,000+ points in a single game");
        _addAchievementType("REGULAR", "Regular Player", "Play 10+ games");
        _addAchievementType("VETERAN", "Veteran", "Play 100+ games");
    }
    
    /**
     * @dev Add a new achievement type (only owner)
     */
    function addAchievementType(
        string memory _achievement,
        string memory _name,
        string memory _description
    ) external onlyOwner {
        _addAchievementType(_achievement, _name, _description);
    }
    
    /**
     * @dev Internal function to add achievement type
     */
    function _addAchievementType(
        string memory _achievement,
        string memory _name,
        string memory _description
    ) internal {
        require(!validAchievements[_achievement], "Achievement already exists");
        require(bytes(_achievement).length > 0, "Achievement cannot be empty");
        
        validAchievements[_achievement] = true;
        achievementMetadata[_achievement] = AchievementMetadata({
            name: _name,
            description: _description,
            imageURI: "",
            totalMinted: 0,
            exists: true
        });
        
        emit AchievementTypeAdded(_achievement, _name, _description);
    }
    
    /**
     * @dev Set the game contract address (only owner)
     */
    function setGameContract(address _gameContract) external onlyOwner {
        gameContract = _gameContract;
    }
    
    /**
     * @dev Mint an achievement NFT (only game contract)
     */
    function mintAchievement(
        address _to,
        string memory _achievement,
        string memory _description
    ) external returns (uint256) {
        require(msg.sender == gameContract, "Only game contract can mint");
        require(validAchievements[_achievement], "Invalid achievement");
        require(!playerAchievements[_to][_achievement], "Achievement already owned");
        
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(_to, tokenId);
        
        // Mark achievement as owned
        playerAchievements[_to][_achievement] = true;
        tokenAchievement[tokenId] = _achievement;
        
        // Update metadata
        achievementMetadata[_achievement].totalMinted++;
        
        // Set token URI
        string memory uri = _generateTokenURI(_achievement, _description);
        _setTokenURI(tokenId, uri);
        
        emit AchievementMinted(_to, _achievement, tokenId);
        return tokenId;
    }
    
    /**
     * @dev Generate token URI for achievement
     */
    function _generateTokenURI(
        string memory _achievement,
        string memory _description
    ) internal view returns (string memory) {
        AchievementMetadata memory metadata = achievementMetadata[_achievement];
        
        // Create JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name": "', metadata.name, '",',
            '"description": "', _description, '",',
            '"image": "', _baseTokenURI, _achievement, '.png",',
            '"attributes": [',
                '{"trait_type": "Achievement", "value": "', _achievement, '"},',
                '{"trait_type": "Rarity", "value": "', _getRarity(_achievement), '"},',
                '{"trait_type": "Total Minted", "value": ', metadata.totalMinted.toString(), '}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @dev Get achievement rarity
     */
    function _getRarity(string memory _achievement) internal pure returns (string memory) {
        if (keccak256(bytes(_achievement)) == keccak256(bytes("MASTER"))) {
            return "Legendary";
        } else if (keccak256(bytes(_achievement)) == keccak256(bytes("PRO"))) {
            return "Epic";
        } else if (keccak256(bytes(_achievement)) == keccak256(bytes("VETERAN"))) {
            return "Rare";
        } else {
            return "Common";
        }
    }
    
    /**
     * @dev Simple base64 encode function (simplified to avoid stack too deep)
     */
    function _base64Encode(bytes memory /* data */) internal pure returns (string memory) {
        // For simplicity, we'll return a placeholder for now
        // In production, you'd want to use a proper base64 library
        return "base64-encoded-data";
    }
    
    /**
     * @dev Check if player has specific achievement
     */
    function hasAchievement(address _player, string memory _achievement) external view returns (bool) {
        return playerAchievements[_player][_achievement];
    }
    
    /**
     * @dev Get all achievements for a player
     */
    function getPlayerAchievements(address _player) external view returns (string[] memory) {
        // Count achievements first
        uint256 count = 0;
        string[] memory allAchievements = getAllAchievementTypes();
        
        for (uint256 i = 0; i < allAchievements.length; i++) {
            if (playerAchievements[_player][allAchievements[i]]) {
                count++;
            }
        }
        
        // Create result array
        string[] memory result = new string[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allAchievements.length; i++) {
            if (playerAchievements[_player][allAchievements[i]]) {
                result[index] = allAchievements[i];
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Get all achievement types
     */
    function getAllAchievementTypes() public pure returns (string[] memory) {
        string[] memory achievements = new string[](5);
        achievements[0] = "BEGINNER";
        achievements[1] = "PRO";
        achievements[2] = "MASTER";
        achievements[3] = "REGULAR";
        achievements[4] = "VETERAN";
        return achievements;
    }
    
    /**
     * @dev Get achievement metadata
     */
    function getAchievementMetadata(string memory _achievement) 
        external 
        view 
        returns (AchievementMetadata memory) 
    {
        return achievementMetadata[_achievement];
    }
    
    /**
     * @dev Set base URI (only owner)
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        _baseTokenURI = _baseURI;
    }
    
    /**
     * @dev Override required functions
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

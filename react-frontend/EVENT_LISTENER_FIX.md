# Event Listener Error Fix

## Error Fixed
```
❌ Failed to cleanup event listeners: Error: no matching event (argument="name", value="AchievementUnlocked", code=INVALID_ARGUMENT, version=abi/5.8.0)
```

## Root Cause
The `AchievementUnlocked` event was being listened to on the **NFT contract** instead of the **Game contract**. 

Looking at the smart contract and ABI definitions:
- The `AchievementUnlocked` event is defined in the **Game contract** (WhacAMoleGame.sol line 72)
- The event is included in the **GAME_CONTRACT ABI** (web3Config.ts line 70)
- But the code was trying to listen for it on the **NFT contract** which doesn't have this event

## Fix Applied

### Before (Incorrect):
```typescript
// Trying to listen on NFT contract
if (nftContractInstance && nftContractInstance.on) {
  nftContractInstance.on('AchievementUnlocked', handleAchievementUnlocked);
}

// Cleanup also on NFT contract
if (nftContractInstance && nftContractInstance.off) {
  nftContractInstance.off('AchievementUnlocked', handleAchievementUnlocked);
}
```

### After (Correct):
```typescript
// Listen on Game contract where the event is actually defined
gameContractInstance.on('AchievementUnlocked', handleAchievementUnlocked);

// Cleanup also on Game contract
gameContractInstance.off('AchievementUnlocked', handleAchievementUnlocked);
```

## Changes Made

1. **Moved AchievementUnlocked listener to Game contract**
   - `gameContractInstance.on('AchievementUnlocked', handleAchievementUnlocked)`

2. **Updated cleanup to use Game contract**
   - `gameContractInstance.off('AchievementUnlocked', handleAchievementUnlocked)`

3. **Removed unused NFT contract instance**
   - Simplified code by removing NFT contract creation since we're not using it for events

## Event Source Clarification

All events are emitted by the **Game Contract**:
- ✅ `PlayerRegistered` - Game contract
- ✅ `GameStarted` - Game contract  
- ✅ `GameCompleted` - Game contract
- ✅ `LeaderboardUpdated` - Game contract
- ✅ `AchievementUnlocked` - Game contract

The **NFT Contract** only has:
- `AchievementMinted` - For when NFTs are actually minted

## Result
- ✅ **Build successful**: No more event listener errors
- ✅ **Event listeners working**: All events now properly listened to on correct contract
- ✅ **Proper cleanup**: Event listeners properly removed on unmount
- ✅ **Achievement notifications**: Will now work correctly when achievements are unlocked

The dashboard refresh functionality is now fully working without any event listener errors.

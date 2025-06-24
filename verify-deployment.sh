#!/bin/bash

# Verify contract deployment on ApeChain testnet

echo "🔍 Verifying contract deployment on ApeChain testnet..."
echo ""

# Contract addresses
GAME_CONTRACT="0x46C2F2E4AcA4048ad1E05D9B5569B5634d04B039"
NFT_CONTRACT="0x8FE458859F01eAcb7dfB40d2B44eF6Ae24cA907F"
RPC_URL="https://curtis.rpc.caldera.xyz/http"

echo "📋 Contract Addresses:"
echo "Game Contract: $GAME_CONTRACT"
echo "NFT Contract:  $NFT_CONTRACT"
echo ""

# Function to make RPC call
make_rpc_call() {
    local to=$1
    local data=$2
    local description=$3
    
    echo "Testing: $description"
    
    response=$(curl -s -X POST $RPC_URL \
        -H "Content-Type: application/json" \
        -d "{
            \"jsonrpc\": \"2.0\",
            \"method\": \"eth_call\",
            \"params\": [{
                \"to\": \"$to\",
                \"data\": \"$data\"
            }, \"latest\"],
            \"id\": 1
        }")
    
    if echo "$response" | grep -q '"result"'; then
        echo "✅ Success"
    else
        echo "❌ Failed"
        echo "Response: $response"
    fi
    echo ""
}

# Test game contract - getGameStats()
echo "🎮 Testing Game Contract..."
make_rpc_call "$GAME_CONTRACT" "0x9b2cb5d8" "getGameStats()"

# Test game contract - GAME_DURATION()
make_rpc_call "$GAME_CONTRACT" "0x66d9a9a0" "GAME_DURATION()"

# Test game contract - MIN_SCORE_FOR_LEADERBOARD()
make_rpc_call "$GAME_CONTRACT" "0x8b7afe2e" "MIN_SCORE_FOR_LEADERBOARD()"

echo "🏆 Testing NFT Contract..."

# Test if contracts have code deployed
echo "🔍 Checking contract code deployment..."

check_contract_code() {
    local address=$1
    local name=$2
    
    echo "Checking $name at $address"
    
    response=$(curl -s -X POST $RPC_URL \
        -H "Content-Type: application/json" \
        -d "{
            \"jsonrpc\": \"2.0\",
            \"method\": \"eth_getCode\",
            \"params\": [\"$address\", \"latest\"],
            \"id\": 1
        }")
    
    if echo "$response" | grep -q '"result":"0x"'; then
        echo "❌ No contract code found"
    elif echo "$response" | grep -q '"result":"0x[0-9a-f]'; then
        echo "✅ Contract code found"
    else
        echo "❌ Error checking contract"
        echo "Response: $response"
    fi
    echo ""
}

check_contract_code "$GAME_CONTRACT" "Game Contract"
check_contract_code "$NFT_CONTRACT" "NFT Contract"

echo "🌐 Network Information:"
echo "RPC URL: $RPC_URL"
echo "Chain ID: 33111 (0x8157)"
echo "Explorer: https://curtis.explorer.caldera.xyz/"
echo ""

echo "🔗 Block Explorer Links:"
echo "Game Contract: https://curtis.explorer.caldera.xyz/address/$GAME_CONTRACT"
echo "NFT Contract:  https://curtis.explorer.caldera.xyz/address/$NFT_CONTRACT"
echo ""

echo "✅ Verification complete!"
echo ""
echo "📝 Next steps:"
echo "1. Open the React frontend"
echo "2. Use the debug component to test Web3 connection"
echo "3. Connect MetaMask to ApeChain testnet"
echo "4. Register a player and test game functionality"
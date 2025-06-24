// Web3 Connection Test Component

import React, { useState } from 'react';
import { debugWeb3Connection } from '../utils/web3Debug';
import { useWeb3 } from '../contexts/Web3Context';

const Web3ConnectionTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { web3State, connect, refreshData } = useWeb3();

  const runTest = async () => {
    setIsRunning(true);
    try {
      await debugWeb3Connection();
      console.log('Test completed - check console for details');
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Web3 Connection Test</h3>
      
      <div className="space-y-2 mb-4">
        <p><strong>Connected:</strong> {web3State.isConnected ? 'Yes' : 'No'}</p>
        <p><strong>Account:</strong> {web3State.account || 'None'}</p>
        <p><strong>Chain ID:</strong> {web3State.chainId || 'None'}</p>
        <p><strong>Player Registered:</strong> {web3State.playerData?.isRegistered ? 'Yes' : 'No'}</p>
      </div>

      <div className="space-x-2">
        <button
          onClick={runTest}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Debug Test'}
        </button>

        <button
          onClick={handleConnect}
          disabled={web3State.isConnected}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Connect Wallet
        </button>

        <button
          onClick={handleRefresh}
          disabled={!web3State.isConnected}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Refresh Data
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Open browser console to see detailed debug information.</p>
      </div>
    </div>
  );
};

export default Web3ConnectionTest;
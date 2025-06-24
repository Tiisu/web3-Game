// Enhanced Debug component to help troubleshoot Web3 data loading issues

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useGameContext } from '../contexts/GameContext';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, RefreshCw, Database, Wifi, WifiOff, AlertTriangle, CheckCircle, XCircle, Play } from 'lucide-react';
import { contractDiagnostics, DiagnosticResult } from '../utils/contractDiagnostics';

const Web3DataDebug: React.FC = () => {
  const { web3State, refreshData, isLoading } = useWeb3();
  const { gameStats } = useGameContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered from debug panel');
    await refreshData();
  };

  const runDiagnostics = async () => {
    setIsDiagnosticRunning(true);
    try {
      const results = await contractDiagnostics.runFullDiagnostics(web3State.account || undefined);
      setDiagnostics(results);
      console.log('🔍 Diagnostics completed:', results);
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
    } finally {
      setIsDiagnosticRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="web3-debug-panel">
      <button 
        className="debug-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Database className="w-4 h-4" />
        <span>Debug Data</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <motion.div
          className="debug-content"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Connection Status */}
          <div className="debug-section">
            <h4>🔗 Connection Status</h4>
            <div className="debug-grid">
              <div className="debug-item">
                <span className="debug-label">Connected:</span>
                <span className={`debug-value ${web3State.isConnected ? 'success' : 'error'}`}>
                  {web3State.isConnected ? (
                    <>
                      <Wifi className="w-4 h-4" />
                      Yes
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4" />
                      No
                    </>
                  )}
                </span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Account:</span>
                <span className="debug-value">
                  {web3State.account ? `${web3State.account.slice(0, 6)}...${web3State.account.slice(-4)}` : 'None'}
                </span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Chain ID:</span>
                <span className="debug-value">{web3State.chainId || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Player Data */}
          <div className="debug-section">
            <h4>👤 Player Data</h4>
            <div className="debug-grid">
              <div className="debug-item">
                <span className="debug-label">Registered:</span>
                <span className={`debug-value ${web3State.playerData?.isRegistered ? 'success' : 'error'}`}>
                  {web3State.playerData?.isRegistered ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Username:</span>
                <span className="debug-value">{web3State.playerData?.username || 'None'}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Games Played:</span>
                <span className="debug-value">{web3State.playerData?.totalGamesPlayed || 0}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Total Score:</span>
                <span className="debug-value">{web3State.playerData?.totalScore?.toLocaleString() || 0}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Highest Score:</span>
                <span className="debug-value">{web3State.playerData?.highestScore?.toLocaleString() || 0}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Moles Hit:</span>
                <span className="debug-value">{web3State.playerData?.totalMolesHit?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Local Game Stats */}
          <div className="debug-section">
            <h4>💻 Local Game Stats</h4>
            <div className="debug-grid">
              <div className="debug-item">
                <span className="debug-label">Games Played:</span>
                <span className="debug-value">{gameStats.gamesPlayed || 0}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Total Score:</span>
                <span className="debug-value">{gameStats.totalScore?.toLocaleString() || 0}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Highest Level:</span>
                <span className="debug-value">{gameStats.highestLevel || 0}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Average Score:</span>
                <span className="debug-value">{gameStats.averageScore?.toLocaleString() || 0}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Moles Hit:</span>
                <span className="debug-value">{gameStats.molesHit?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Achievements & Leaderboard */}
          <div className="debug-section">
            <h4>🏆 Blockchain Data</h4>
            <div className="debug-grid">
              <div className="debug-item">
                <span className="debug-label">Achievements:</span>
                <span className="debug-value">{web3State.achievements.length}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Leaderboard Entries:</span>
                <span className="debug-value">{web3State.leaderboard.length}</span>
              </div>
              <div className="debug-item">
                <span className="debug-label">Current Game ID:</span>
                <span className="debug-value">{web3State.currentGameId || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Contract Diagnostics */}
          <div className="debug-section">
            <h4>🔍 Contract Diagnostics</h4>
            <div className="debug-actions">
              <button 
                className="debug-diagnostics-btn"
                onClick={runDiagnostics}
                disabled={isDiagnosticRunning}
              >
                <Play className={`w-4 h-4 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
                {isDiagnosticRunning ? 'Running...' : 'Run Diagnostics'}
              </button>
            </div>
            
            {diagnostics.length > 0 && (
              <div className="diagnostics-results">
                {diagnostics.map((result, index) => (
                  <div key={index} className="diagnostic-item">
                    <div className="diagnostic-header">
                      {getStatusIcon(result.success)}
                      <span className="diagnostic-message">{result.message}</span>
                    </div>
                    {result.error && (
                      <div className="diagnostic-error">{result.error}</div>
                    )}
                    {result.data && (
                      <div className="diagnostic-data">
                        <pre>{JSON.stringify(result.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="debug-actions">
            <button 
              className="debug-refresh-btn"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Web3DataDebug;
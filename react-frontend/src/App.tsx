import React from 'react';
import { Web3Provider } from './contexts/Web3Context';
import { GameProvider } from './contexts/GameContext';
import { NotificationProvider } from './contexts/NotificationContext';
import GameContainer from './components/GameContainer';
import './App.css';

function App() {
  return (
    <div className="App">
      <Web3Provider>
        <GameProvider>
          <NotificationProvider>
            <GameContainer />
          </NotificationProvider>
        </GameProvider>
      </Web3Provider>
    </div>
  );
}

export default App;

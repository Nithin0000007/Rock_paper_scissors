import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import HomeScreen from './components/HomeScreen';
import GameRoom from './components/GameRoom';

const socket = io('http://localhost:4000');

function App() {
  const [screen, setScreen] = useState('home');
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    socket.on('error', (message) => {
      setError(message);
    });

    socket.on('roomUpdate', (data) => {
      setRoomData(data);
    });

    socket.on('roundResult', (data) => {
      setRoomData(prev => ({
        ...prev,
        players: [
          { ...prev.players[0], ...data.player1 },
          { ...prev.players[1], ...data.player2 }
        ],
        round: data.round
      }));
    });

    socket.on('gameOver', (data) => {
      setRoomData(prev => ({
        ...prev,
        players: [
          { ...prev.players[0], ...data.player1 },
          { ...prev.players[1], ...data.player2 }
        ],
        gameState: 'finished'
      }));
    });

    socket.on('playerLeft', (data) => {
      setRoomData(data);
      setError('The other player has left the game');
    });

    return () => {
      socket.off('error');
      socket.off('roomUpdate');
      socket.off('roundResult');
      socket.off('gameOver');
      socket.off('playerLeft');
    };
  }, []);

  const createRoom = (name) => {
    setPlayerName(name);
    socket.emit('createRoom', name);
    setScreen('waiting');
  };

  const joinRoom = (name, roomId) => {
    setPlayerName(name);
    setRoomId(roomId);
    socket.emit('joinRoom', { roomId, playerName: name });
    setScreen('game');
  };

  const handleRoomCreated = (id) => {
    setRoomId(id);
    setScreen('waiting');
  };

  useEffect(() => {
    socket.on('roomCreated', handleRoomCreated);
    return () => {
      socket.off('roomCreated', handleRoomCreated);
    };
  }, []);

  const makeChoice = (choice) => {
    socket.emit('makeChoice', { choice });
  };

  const playAgain = () => {
    setScreen('home');
    setRoomData(null);
    setRoomId('');
    setPlayerName('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {screen === 'home' && (
        <HomeScreen 
          onCreateRoom={createRoom} 
          onJoinRoom={joinRoom} 
          error={error}
          clearError={() => setError('')}
        />
      )}
      {(screen === 'waiting' || screen === 'game') && roomData && (
        <GameRoom 
          roomData={roomData} 
          roomId={roomId} 
          playerName={playerName} 
          socketId={socket.id}
          onMakeChoice={makeChoice}
          onPlayAgain={playAgain}
          error={error}
        />
      )}
    </div>
  );
}

export default App;
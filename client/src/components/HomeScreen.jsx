import React, { useState } from 'react';

const HomeScreen = ({ onCreateRoom, onJoinRoom, error, clearError }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState('create'); // 'create' or 'join'

  const handleSubmit = (e) => {
    e.preventDefault();
    clearError();
    if (!playerName.trim()) return;
    
    if (mode === 'create') {
      onCreateRoom(playerName);
    } else {
      if (!roomId.trim()) return;
      onJoinRoom(playerName, roomId);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">Rock Paper Scissors</h1>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">
          {error}
        </div>
      )}
      
      <div className="flex mb-6">
        <button
          onClick={() => setMode('create')}
          className={`flex-1 py-2 ${mode === 'create' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          Create Room
        </button>
        <button
          onClick={() => setMode('join')}
          className={`flex-1 py-2 ${mode === 'join' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          Join Room
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        {mode === 'join' && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          {mode === 'create' ? 'Create Room' : 'Join Room'}
        </button>
      </form>
    </div>
  );
};

export default HomeScreen;
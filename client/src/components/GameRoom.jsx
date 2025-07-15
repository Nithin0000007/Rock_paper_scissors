import React from 'react';

const GameRoom = ({ roomData, roomId, playerName, socketId, onMakeChoice, onPlayAgain, error }) => {
  const currentPlayer = roomData.players.find(p => p.id === socketId);
  const opponent = roomData.players.find(p => p.id !== socketId);
  const isPlayerReady = currentPlayer?.isReady;
  const isOpponentReady = opponent?.isReady;
  const isGameOver = roomData.gameState === 'finished';
  const isWaitingForOpponent = roomData.players.length < 2;

  const getResultMessage = () => {
    if (isGameOver) {
      if (currentPlayer.score > (opponent?.score || 0)) {
        return 'You won the game!';
      } else if (currentPlayer.score < (opponent?.score || 0)) {
        return 'You lost the game!';
      } else {
        return 'The game ended in a tie!';
      }
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600">Room: {roomId}</h2>
        <div className="text-gray-600">Round: {roomData.round}/{roomData.maxRounds}</div>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">
          {error}
        </div>
      )}

      {isWaitingForOpponent && (
        <div className="mb-6 text-center">
          <p className="text-lg mb-4">Waiting for opponent to join...</p>
          <p className="text-gray-600">Share this room ID: <span className="font-bold">{roomId}</span></p>
        </div>
      )}

      <div className="flex justify-between mb-8">
        <div className={`text-center p-4 rounded-lg ${currentPlayer?.id === socketId ? 'bg-indigo-50' : ''}`}>
          <h3 className="font-bold text-lg">{currentPlayer?.name} (You)</h3>
          <p className="text-2xl font-bold">{currentPlayer?.score || 0}</p>
          {currentPlayer?.choice && (
            <p className="mt-2">Chose: {currentPlayer.choice}</p>
          )}
          {isPlayerReady && !isGameOver && (
            <p className="text-green-600">Ready!</p>
          )}
        </div>

        {opponent ? (
          <div className={`text-center p-4 rounded-lg ${opponent.id !== socketId ? 'bg-indigo-50' : ''}`}>
            <h3 className="font-bold text-lg">{opponent.name}</h3>
            <p className="text-2xl font-bold">{opponent.score || 0}</p>
            {opponent.choice && (
              <p className="mt-2">Chose: {opponent.choice}</p>
            )}
            {isOpponentReady && !isGameOver && (
              <p className="text-green-600">Ready!</p>
            )}
          </div>
        ) : (
          <div className="text-center p-4 rounded-lg bg-gray-100">
            <h3 className="font-bold text-lg">Waiting for opponent</h3>
            <p className="text-gray-500">-</p>
          </div>
        )}
      </div>

      {!isGameOver && !isWaitingForOpponent && !isPlayerReady && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4 text-center">Make your choice</h3>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => onMakeChoice('rock')}
              className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-lg text-lg font-bold transition"
            >
              ✊ Rock
            </button>
            <button
              onClick={() => onMakeChoice('paper')}
              className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-lg text-lg font-bold transition"
            >
              ✋ Paper
            </button>
            <button
              onClick={() => onMakeChoice('scissors')}
              className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-lg text-lg font-bold transition"
            >
              ✌️ Scissors
            </button>
          </div>
        </div>
      )}

      {isPlayerReady && !isOpponentReady && !isGameOver && (
        <div className="text-center py-4">
          <p className="text-lg">Waiting for opponent to choose...</p>
        </div>
      )}

      {isGameOver && (
        <div className="text-center py-6">
          <h3 className="text-2xl font-bold mb-4 text-indigo-600">{getResultMessage()}</h3>
          <button
            onClick={onPlayAgain}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
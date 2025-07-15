const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = {};
const players = {};

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('createRoom', (playerName) => {
    const roomId = generateRoomId();
    rooms[roomId] = {
      players: [{
        id: socket.id,
        name: playerName,
        score: 0,
        choice: null,
        isReady: false
      }],
      gameState: 'waiting',
      round: 0,
      maxRounds: 5
    };
    
    players[socket.id] = roomId;
    socket.join(roomId);
    socket.emit('roomCreated', roomId);
    io.to(roomId).emit('roomUpdate', rooms[roomId]);
  });

  socket.on('joinRoom', ({ roomId, playerName }) => {
    if (!rooms[roomId]) {
      socket.emit('error', 'Room does not exist');
      return;
    }

    if (rooms[roomId].players.length >= 2) {
      socket.emit('error', 'Room is full');
      return;
    }

    rooms[roomId].players.push({
      id: socket.id,
      name: playerName,
      score: 0,
      choice: null,
      isReady: false
    });

    players[socket.id] = roomId;
    socket.join(roomId);
    io.to(roomId).emit('roomUpdate', rooms[roomId]);
  });

  socket.on('makeChoice', ({ choice }) => {
    const roomId = players[socket.id];
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.choice = choice;
      player.isReady = true;
    }

    // Check if both players are ready
    const allReady = room.players.every(p => p.isReady);
    if (allReady && room.players.length === 2) {
      room.gameState = 'playing';
      const result = determineRoundWinner(room.players[0], room.players[1]);
      
      if (result.winner) {
        result.winner.score++;
      }
      
      room.round++;
      
      // Send results to players
      io.to(roomId).emit('roundResult', {
        winner: result.winner ? result.winner.id : null,
        player1: room.players[0],
        player2: room.players[1],
        round: room.round
      });

      // Reset choices for next round
      room.players.forEach(p => {
        p.choice = null;
        p.isReady = false;
      });

      // Check if game is over
      if (room.round >= room.maxRounds) {
        room.gameState = 'finished';
        io.to(roomId).emit('gameOver', {
          player1: room.players[0],
          player2: room.players[1]
        });
      }
    }

    io.to(roomId).emit('roomUpdate', room);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const roomId = players[socket.id];
    if (roomId && rooms[roomId]) {
      rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
      
      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit('playerLeft', rooms[roomId]);
      }
      
      delete players[socket.id];
    }
  });
});

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function determineRoundWinner(player1, player2) {
  const choices = {
    rock: { beats: 'scissors' },
    paper: { beats: 'rock' },
    scissors: { beats: 'paper' }
  };

  if (player1.choice === player2.choice) {
    return { winner: null };
  }

  if (choices[player1.choice].beats === player2.choice) {
    return { winner: player1 };
  } else {
    return { winner: player2 };
  }
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
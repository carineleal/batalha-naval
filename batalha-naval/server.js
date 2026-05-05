const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);

    socket.on('joinRoom', (roomId) => {
        if (!rooms[roomId]) {
            rooms[roomId] = { 
                players: [], 
                gameState: { 
                    phase: 'setup', 
                    currentTurn: 1,
                    readyPlayers: 0 
                } 
            };
        }

        const room = rooms[roomId];
        if (room.players.length < 2) {
            const playerNum = room.players.length + 1;
            room.players.push({ id: socket.id, playerNum, ships: [], hits: 0 });
            socket.join(roomId);
            socket.emit('playerAssignment', playerNum);

            if (room.players.length === 2) {
                io.to(roomId).emit('gameStart', 'Ambos os jogadores conectados!');
            }
        } else {
            socket.emit('error', 'A sala está cheia.');
        }
    });

    socket.on('shipsReady', ({ roomId, ships }) => {
        const room = rooms[roomId];
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.ships = ships.map(s => ({ ...s, hitCount: 0 }));
            room.gameState.readyPlayers++;

            if (room.gameState.readyPlayers === 2) {
                io.to(roomId).emit('startBattle', room.gameState.currentTurn);
            }
        }
    });

    socket.on('fireShot', ({ roomId, x, y }) => {
        const room = rooms[roomId];
        if (!room || room.gameState.phase === 'finished') return;

        const shooter = room.players.find(p => p.id === socket.id);
        if (shooter.playerNum !== room.gameState.currentTurn) return;

        const targetPlayer = room.players.find(p => p.playerNum !== shooter.playerNum);
        let hit = false;
        let sunk = false;

        targetPlayer.ships.forEach(ship => {
            ship.cells.forEach(cell => {
                if (cell.x == x && cell.y == y) {
                    hit = true;
                    ship.hitCount++;
                    if (ship.hitCount === ship.size) sunk = true;
                }
            });
        });

        if (!hit) {
            room.gameState.currentTurn = targetPlayer.playerNum;
        }

        io.to(roomId).emit('shotResult', {
            x, y, hit, sunk,
            playerWhoShot: shooter.playerNum,
            nextTurn: room.gameState.currentTurn
        });

        // Verificação de vitória simplificada (total de hits)
        const totalHitsNeeded = targetPlayer.ships.reduce((a, b) => a + b.size, 0);
        const currentHits = targetPlayer.ships.reduce((a, b) => a + b.hitCount, 0);

        if (currentHits === totalHitsNeeded) {
            io.to(roomId).emit('gameOver', shooter.playerNum);
            room.gameState.phase = 'finished';
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
        // Em um sistema real, aqui notificaríamos o outro jogador
    });
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

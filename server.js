// 파일명: server.js (중계 서버 메인)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));
let players = [];

io.on('connection', (socket) => {
    console.log(`[+] 새로운 기기 접속됨: ${socket.id}`);

    socket.on('join_game', (data) => {
        players = players.filter(p => p.id !== socket.id && p.name !== data.name);
        const playerInfo = { id: socket.id, name: data.name, color: data.color };
        players.push(playerInfo);
        socket.emit('join_success', playerInfo);
        io.emit('update_players', players);
    });

    socket.on('player_rolled', (data) => {
        io.emit('player_rolled', data);
    });

    socket.on('tv_state_change', (state) => {
        io.emit('tv_state_change', state);
        if (state && state.state === 'BACK_TO_LOBBY') {
            players = []; 
            io.emit('update_players', players);
        }
    });

    socket.on('disconnect', () => {
        players = players.filter(p => p.id !== socket.id);
        io.emit('update_players', players);
    });
});

// [수정됨] 클라우드 환경(Render)에서 제공하는 포트 번호를 사용하도록 변경
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 레이싱 게임 중계 서버가 켜졌습니다!`);
    console.log(`포트 번호: ${PORT}`);
    console.log(`========================================`);
});
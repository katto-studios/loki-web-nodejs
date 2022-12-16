"use strict";
//NOT BEING USED
Object.defineProperty(exports, "__esModule", { value: true });
const multiplayer_types_1 = require("./types/multiplayer-types");
var io;
const clientsOnline = {};
const activeGames = {};
const VALID_CHARS = 'ABCDEFGHJKMNOPQRSTUVWXZ';
function initalizeSocketIo(server) {
    io = require('socket.io')(server);
    io.on('connection', socket => {
        // console.log(`${socket.id} connected!`);
        let client = new multiplayer_types_1.Client(socket.id, socket);
        clientsOnline[client.m_socketId] = client;
        client.onConnect();
        socket.on('disconnect', () => {
            client.onDisconnect();
            delete clientsOnline[socket.id];
        });
        socket.on('authDetails', token => {
            client.authenticateUser(token);
        });
        socket.on('createRoom', (_, ack) => {
            const [roomCode, gameInstance] = createGame(client, io);
            client.joinGame(gameInstance);
            ack(roomCode);
        });
        socket.on('joinRoom', (roomCode, ack) => {
            const [joinGameResult, roomInstance] = tryJoinRoom(roomCode);
            if (joinGameResult) {
                client.joinGame(roomInstance);
                ack({
                    success: joinGameResult,
                    roomInstance: roomInstance.getRoomData()
                });
            }
            else {
                ack({
                    success: joinGameResult
                });
            }
        });
        socket.on('leaveRoom', (arg, ack) => {
            ack(tryLeaveGame(client));
        });
        socket.on('updatePlayerCursors', data => {
            client.m_currentGameLobby.emit('updatePlayerCursors', {
                user: socket.id,
                data: data
            });
        });
        socket.to(client.m_socketId).emit('showPopup', 'Multiplayer Servers are Online');
    });
}
function createGame(_leader, _io) {
    let roomCode = getRandomString(5);
    while (activeGames[roomCode])
        roomCode = getRandomString(5);
    let newInstance = new multiplayer_types_1.GameLobby(_leader, roomCode, _io);
    activeGames[roomCode] = newInstance;
    return [roomCode, newInstance];
}
function tryJoinRoom(_roomCode) {
    if (activeGames[_roomCode]) {
        return [!activeGames[_roomCode].m_isGameInProgress, activeGames[_roomCode]];
    }
    return [Boolean(activeGames[_roomCode]), activeGames[_roomCode]];
}
function tryLeaveGame(_client) {
    let room = _client.m_currentGameLobby;
    let result = _client.leaveGame();
    if (Object.keys(room.m_playersInRoom).length <= 0) {
        delete (activeGames[room.m_roomCode]);
    }
    return result;
}
function getRandomString(_length) {
    let returnMe = '';
    for (let count = 0; count < _length; count++) {
        returnMe += VALID_CHARS.charAt(Math.floor(Math.random() * VALID_CHARS.length));
    }
    return returnMe;
}
module.exports = { initalizeSocketIo };

//NOT BEING USED

import * as socketio from "socket.io";
import { Client, GameLobby } from "./types/multiplayer-types";

var io: socketio.Server;
const clientsOnline: { [id: string]: Client } = {};
const activeGames: { [id: string]: GameLobby } = {};
const VALID_CHARS = 'ABCDEFGHJKMNOPQRSTUVWXZ';

function initalizeSocketIo(server) {
    io = require('socket.io')(server);
    io.on('connection', socket => {
        // console.log(`${socket.id} connected!`);
        let client = new Client(socket.id, socket);
        clientsOnline[client.m_socketId] = client;
        client.onConnect();

        socket.on('disconnect', () => {
            client.onDisconnect();
            delete clientsOnline[socket.id];
        });

        socket.on('authDetails', token => {
            client.authenticateUser(token);
        });

        socket.on('createRoom', (_, ack) =>{
            const [roomCode, gameInstance] = createGame(client, io);
            client.joinGame(gameInstance);
            ack(roomCode);
        });

        socket.on('joinRoom', (roomCode, ack) => {
            const [joinGameResult, roomInstance] = tryJoinRoom(roomCode);
            if(joinGameResult){
                client.joinGame(roomInstance);
                ack({
                    success: joinGameResult,
                    roomInstance: roomInstance.getRoomData()
                });
            }else{
                ack({
                    success: joinGameResult
                });
            }
        });

        socket.on('leaveRoom', (arg, ack) =>{
            ack(tryLeaveGame(client));
        });

        socket.on('updatePlayerCursors', data =>{
            client.m_currentGameLobby.emit('updatePlayerCursors', {
                user: socket.id,
                data: data
            })
        });

        socket.to(client.m_socketId).emit('showPopup', 'Multiplayer Servers are Online');
    });
}

function createGame(_leader: Client, _io: socketio.Server): [string, GameLobby]{
    let roomCode = getRandomString(5);
    while(activeGames[roomCode]) roomCode = getRandomString(5);
    let newInstance = new GameLobby(_leader, roomCode, _io);
    activeGames[roomCode] = newInstance;    
    return [roomCode, newInstance];
}

function tryJoinRoom(_roomCode: string): [boolean, GameLobby]{
    if(activeGames[_roomCode]){
        return [!activeGames[_roomCode].m_isGameInProgress, activeGames[_roomCode]];
    }
    return [Boolean(activeGames[_roomCode]), activeGames[_roomCode]];
}

function tryLeaveGame(_client: Client): boolean{
    let room = _client.m_currentGameLobby;
    let result = _client.leaveGame();
    if(Object.keys(room.m_playersInRoom).length <= 0) {
        delete(activeGames[room.m_roomCode]);
    }
    return result;
}

function getRandomString(_length: number) : string{
    let returnMe = '';
    for(let count = 0; count < _length; count++){
        returnMe += VALID_CHARS.charAt(Math.floor(Math.random() * VALID_CHARS.length));
    }
    return returnMe; 
}

module.exports = { initalizeSocketIo }
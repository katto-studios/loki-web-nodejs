"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameLobby = exports.Client = void 0;
const { updateClient, getClientWithUserdata } = require('../../mongo-db-helper'); //Since it compiles to /js, the file path is different
const { verify } = require('../../google-login');
class Client {
    constructor(_id, _socket) {
        // console.log(`New client with id ${_id}!`);
        this.m_socketId = _id;
        this.m_socket = _socket;
    }
    onDisconnect() {
        // console.log(`${socket.id} disconnected!`);
        if (Boolean(this.m_currentGameLobby))
            this.leaveGame();
        updateClient(this.m_socketId, {
            $set: {
                status: new Date().getTime()
            }
        });
    }
    onConnect() {
    }
    async authenticateUser(_token) {
        let userData = await verify(_token);
        this.m_clientData = await getClientWithUserdata(userData);
        // console.log(`${this.m_clientData.username} connected!`);
        updateClient(this.m_clientData._id, {
            $set: {
                status: 0
            }
        });
    }
    joinGame(_gameInstance) {
        if (Boolean(this.m_currentGameLobby))
            this.leaveGame();
        this.m_currentGameLobby = _gameInstance;
        this.m_currentGameLobby.onPlayerJoin(this);
        this.m_socket.join(_gameInstance.m_roomCode);
    }
    leaveGame() {
        if (!Boolean(this.m_currentGameLobby))
            return false;
        this.m_socket.leave(this.m_currentGameLobby.m_roomCode);
        this.m_currentGameLobby.onPlayerLeave(this);
        this.m_currentGameLobby = null;
        return true;
    }
    getLiteData() {
        //copy data
        let copy = JSON.parse(JSON.stringify(this.m_clientData));
        copy.img_url = copy.google_account_info.img_url;
        delete copy.google_account_info;
        delete copy.coins;
        delete copy.pending_friends;
        delete copy.friends;
        delete copy.inventory;
        delete copy.favourites;
        return copy;
    }
}
exports.Client = Client;
class GameLobby {
    constructor(_leader, _roomName, _io) {
        this.m_playersInRoom = {};
        this.m_leader = _leader;
        this.m_io = _io;
        this.m_roomCode = _roomName;
        this.m_roomSeed = Math.random();
    }
    startGame() {
        this.m_isGameInProgress = true;
        this.emit('gameCountdown');
    }
    onPlayerLeave(_player) {
        this.emit('playerLeave', { socketId: _player.m_socketId });
        delete (this.m_playersInRoom[_player.m_socketId]);
        if (this.m_isGameInProgress) {
            this.emit('gameEnd', {
                scores: []
            });
        }
        // console.log(`${_player.m_clientData.username} left room ${this.m_roomCode}!`);
    }
    onPlayerJoin(_player) {
        this.emit('playerJoin', {
            socketId: _player.m_socketId,
            userInfo: _player.getLiteData()
        });
        this.m_playersInRoom[_player.m_socketId] = _player;
        if (Object.keys(this.m_playersInRoom).length > 1)
            this.startGame();
        // console.log(`${_player.m_clientData.username} joined room ${this.m_roomCode}!`);
    }
    getRoomData() {
        let playersData = {};
        for (let key in this.m_playersInRoom) {
            playersData[key] = this.m_playersInRoom[key].getLiteData();
        }
        return {
            roomCode: this.m_roomCode,
            leaderId: this.m_leader.m_socketId,
            players: playersData
        };
    }
    emit(_event, _data) {
        this.m_io.to(this.m_roomCode).emit(_event, _data);
    }
}
exports.GameLobby = GameLobby;

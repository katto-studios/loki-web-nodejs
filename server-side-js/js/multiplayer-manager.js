"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { verify } = require('../google-login');
const { getClientWithUserid, updateClient } = require('../mongo-db-helper');
const { randomWordsGenerator } = require('../../gameplay-modules/mass-multiplayer');
const { getScoreData } = require('../game-utils');
const VALID_CHARS = 'ABCDEFGHJKMNOPQRSTUVWXYZ';
class MultiplayerManager {
    static initalize(_server) {
        this.io = require('socket.io')(_server);
        this.subscribeToEvents();
    }
    static getUsersOnline(_ids) {
        let returnMe = [];
        for(let socketId in this.connectedPlayers) {
            const user = this.connectedPlayers[socketId];
            if(user.userId) {
                if(_ids.some(x => x === user.userId)) {
                    returnMe.push(user.userId);
                }
            }
        }
        return returnMe;
    }
    static getUserFromUid(_id) {
        for(let socketId in this.connectedPlayers) {
            const client = this.connectedPlayers[socketId];
            if(client.userId)
                if(client.userId === _id)
                    return client;
        }
        return null;
    }
    static showServerAnnouncement(_message) {
        this.io.emit('showPopup', {
            message: `Server Announcement: ${_message}`,
            delay: 4000
        });
    }
    static subscribeToEvents() {
        this.io.on('connection', socket => {
            let client = new Client(socket);
            this.connectedPlayers[client.socketId] = client;
            socket.emit('showPopup', {
                message: process.env.STARTUP_POPUP,
                delay: 4000
            });
            socket.on('disconnect', () => {
                this.connectedPlayers[client.socketId].onDisconnect();
                delete (this.connectedPlayers[client.socketId]);
            });
            socket.on('authDetails', (token, ack) => {
                client.authenticateUser(token)
                    .then(result => {
                        ack(result);
                    })
                    .catch(err => console.log(err));
            });
            socket.on('createRoom', async (_, ack) => {
                let newRoomData = await this.createNewRoom(client).getGameData();
                ack(newRoomData);
            });
            socket.on('joinRoom', async (roomCode, ack) => {
                if(await this.tryJoinRoom(client, roomCode)) {
                    ack({
                        success: true,
                        roomInstance: await this.activeGames[roomCode].getGameData()
                    });
                }
                else {
                    ack({ success: false });
                }
            });
            socket.on('leaveRoom', (args, ack) => {
                if(client.leaveRoom()) {
                    delete (this.activeGames[client.gameInstanceId]);
                }
                client.gameInstanceId = '';
                ack(true);
            });
            socket.on('updatePlayerCursors', data => {
                client.updateCursor(data);
            });
            socket.on('ready', () => {
                client.getCurrentGameInstance().readyUp();
            });
            socket.on('getWords', (count, cb) => {
                cb(client.getCurrentGameInstance().getRoomWords(count, client));
            });
            socket.on('joinQueue', async (args, ack) => {
                let result = await this.joinQueue(client);
                ack({
                    isInQueue: result
                });
            });
            socket.on('forceLeaveQueue', async () => {
                if(this.activeQueue.some(x => x.socketId === client.socketId)) {
                    return await this.joinQueue(client);
                }
                if(client.gameInstanceId) { //when press nav bar in waiting for other person
                    if(client.leaveRoom()) {
                        delete (this.activeGames[client.gameInstanceId]);
                    }
                }
            });
            socket.on('invite-friend', async (args) => {
                const targetId = args.target;
                const targetClient = MultiplayerManager.getUserFromUid(targetId);
                if(!targetClient)
                    return;
                const senderData = await client.getUserDataLite();
                targetClient.socket.emit('showPopup', {
                    message: `
                        <p>${senderData.username} invited you to a game! </p>
                        <br>
                        <u onclick="acceptFriendInvite('${client.gameInstanceId}')">Accept</u>
                        <u onclick="forceHidePopup()">Decline</u>`,
                    delay: 5000
                });
            });
        });
    }
    static getRandomString(_length) {
        let returnMe = '';
        for(let count = 0; count < _length; count++) {
            returnMe += VALID_CHARS.charAt(Math.floor(Math.random() * VALID_CHARS.length));
        }
        return returnMe;
    }
    static createNewRoom(_host) {
        let roomCode = this.getRandomString(5);
        while(this.activeGames[roomCode])
            roomCode = this.getRandomString(5);
        this.activeGames[roomCode] = new GameInstance(_host, roomCode);
        return this.activeGames[roomCode];
    }
    static async tryJoinRoom(_client, _roomCode) {
        if(this.activeGames[_roomCode]) {
            return await this.activeGames[_roomCode].joinGame(_client);
        }
        return false;
    }
    static async joinQueue(_client) {
        if(this.activeQueue.some(x => x.socketId === _client.socketId)) {
            this.activeQueue = this.activeQueue.filter(x => x.socketId !== _client.socketId);
            return false;
        }
        if(this.activeQueue.length > 0) {
            let p1 = this.activeQueue.shift();
            let p2 = _client;
            let instance = this.createNewRoom(p1);
            instance.c2Id = p2.socketId;
            p2.gameInstanceId = instance.roomCode;
            let roomData = await instance.getGameData();
            this.io.to(p1.socketId).emit('matchFound', {
                roomData,
                isHost: true
            });
            this.io.to(p2.socketId).emit('matchFound', {
                roomData,
                isHost: false
            });
        }
        else {
            this.activeQueue.push(_client);
        }
        return true;
    }
}
MultiplayerManager.connectedPlayers = {};
MultiplayerManager.activeGames = {};
MultiplayerManager.activeQueue = [];
class Client {
    constructor(_socket) {
        this.socketId = _socket.id;
        this.socket = _socket;
        this.userId = false;
    }
    async authenticateUser(_token) {
        try {
            this.userId = (await verify(_token))['sub'];
            return true;
        }
        catch {
            return false;
        }
    }
    async getUserDataLite() {
        if(this.m_userDataCache) {
            return this.m_userDataCache;
        }
        return getClientWithUserid(this.userId)
            .then(result => {
                this.m_userDataCache = this.convertUserData(result);
                return this.m_userDataCache;
            })
            .catch(err => console.log(err));
    }
    getCurrentGameInstance() {
        if(!this.gameInstanceId)
            return null;
        return MultiplayerManager.activeGames[this.gameInstanceId];
    }
    onDisconnect() {
        if(this.gameInstanceId) {
            this.getCurrentGameInstance().leaveGame(this);
        }
        updateClient(this.userId, {
            $set: {
                status: new Date().getTime()
            }
        });
    }
    leaveRoom() {
        return this.getCurrentGameInstance().leaveGame(this);
    }
    updateCursor(_data) {
        let currentGameInstance = this.getCurrentGameInstance();
        if(currentGameInstance) {
            this.getCurrentGameInstance().onPlayerCursorUpdate(this, _data);
        }
    }
    convertUserData(_userData) {
        _userData.img_url = _userData.google_account_info.img_url;
        delete _userData.google_account_info;
        delete _userData.coins;
        delete _userData.pending_friends;
        delete _userData.friends;
        delete _userData.inventory;
        delete _userData.favourites;
        return _userData;
    }
}
class GameInstance {
    constructor(_host, _roomCode) {
        this.m_numReady = 0;
        this.m_wordGenerators = {};
        this.m_onGoingTimeout = false;
        this.c1Id = _host.socketId;
        this.m_seed = Math.random();
        this.roomCode = _roomCode;
        this.hasStarted = false;
        _host.gameInstanceId = _roomCode;
    }
    getUsersInInstance() {
        return [
            MultiplayerManager.connectedPlayers[this.c1Id],
            MultiplayerManager.connectedPlayers[this.c2Id]
        ];
    }
    async joinGame(_otherPlayer) {
        if(this.hasStarted)
            return false;
        this.hasStarted = true;
        this.emit('playerJoin', {
            id: _otherPlayer.socketId,
            userData: await _otherPlayer.getUserDataLite()
        });
        this.c2Id = _otherPlayer.socketId;
        _otherPlayer.gameInstanceId = this.roomCode;
        return true;
    }
    emit(_event, _args) {
        if(MultiplayerManager.io.to(this.c1Id))
            MultiplayerManager.io.to(this.c1Id).emit(_event, _args);
        if(MultiplayerManager.io.to(this.c2Id))
            MultiplayerManager.io.to(this.c2Id).emit(_event, _args);
    }
    async getGameData() {
        let c1 = this.c1Id ? MultiplayerManager.connectedPlayers[this.c1Id].getUserDataLite() : false;
        let c2 = this.c2Id ? MultiplayerManager.connectedPlayers[this.c2Id].getUserDataLite() : false;
        return Promise.all([
            c1, c2
        ]).then(res => {
            return {
                c1: {
                    id: this.c1Id,
                    userData: res[0]
                },
                c2: {
                    id: this.c2Id,
                    userData: res[1]
                },
                seed: this.m_seed,
                roomCode: this.roomCode
            };
        });
    }
    readyUp() {
        if(++this.m_numReady == 2) {
            this.startGame();
        }
    }
    leaveGame(_client) {
        if(_client.socketId === this.c1Id) {
            _client.gameInstanceId = '';
            this.c1Id = this.c2Id;
        }
        this.c2Id = '';
        if(this.m_numReady >= 2)
            this.forceEndGame();
        return !Boolean(this.c1Id);
    }
    getRoomWords(_count = 1, _client) {
        let returnMe = [];
        if(!this.m_wordGenerators[_client.socketId])
            this.m_wordGenerators[_client.socketId] = randomWordsGenerator(this.m_seed);
        for(let count = 0; count < _count; count++) {
            returnMe.push(this.m_wordGenerators[_client.socketId].next().value);
        }
        return returnMe;
    }
    onPlayerCursorUpdate(_client, _data) {
        let sendToThisId = _client.socketId === this.c1Id ? this.c2Id : this.c1Id;
        MultiplayerManager.io.to(sendToThisId).emit('updatePlayerCursors', _data);
    }
    forceEndGame() {
        if(this.m_onGoingTimeout) {
            clearTimeout(this.m_onGoingTimeout);
        }
        this.emit('forceGameEnd', {});
    }
    startGame() {
        this.emit('gameCountdown');
        this.waitForMs(5000)
            .then(() => {
                this.emit('gameStart');
                return this.waitForMs(15000);
            })
            .then(() => {
                // console.log('endingGame');
                return this.endGame();
            })
            .catch(console.log);
    }
    endGame() {
        const [c1, c2] = this.getUsersInInstance();
        return Promise.all([
            this.getScoreFromUser(c1),
            this.getScoreFromUser(c2),
        ])
            .then(resArr => {
                let winner = resArr[0].score > resArr[1].score ? 0 : 1;
                let loser = winner === 0 ? 1 : 0;
                //determine score stuff
                return {
                    c1ScoreData: resArr[0],
                    c2ScoreData: resArr[1]
                };
            })
            .then(result => {
                this.emit('gameEnd', result);
                this.m_numReady = 0;
            })
            .catch(console.log);
    }
    getScoreFromUser(_client) {
        return new Promise((resolve, reject) => {
            try {
                _client.socket.emit('getScore', {}, _data => {
                    resolve(getScoreData(_data));
                });
            }
            catch(err) {
                reject(err);
            }
        });
    }
    waitForMs(_duration) {
        return new Promise((resolve, reject) => {
            try {
                this.m_onGoingTimeout = setTimeout(() => {
                    this.m_onGoingTimeout = false;
                    resolve();
                }, _duration);
            }
            catch(err) {
                reject(err);
            }
        });
    }
}
module.exports = {
    MultiplayerManager
};

import * as socketio from "socket.io";
const { updateClient, getClientWithUserdata } = require('../../mongo-db-helper'); //Since it compiles to /js, the file path is different
const { verify } = require('../../google-login');

class Client{
    m_socketId: string;
    m_socket: socketio.Socket;
    m_clientData: any;
    m_currentGameLobby: GameLobby;

    constructor(_id: string, _socket: socketio.Socket){
        // console.log(`New client with id ${_id}!`);
        this.m_socketId = _id;
        this.m_socket = _socket;
    }

    onDisconnect(): void{
        // console.log(`${socket.id} disconnected!`);
        if(Boolean(this.m_currentGameLobby)) this.leaveGame();

        updateClient(this.m_socketId, {
            $set:{
                status: new Date().getTime()
            }
        });
    }

    onConnect(): void{

    }

    async authenticateUser(_token: string): Promise<void>{
        let userData = await verify(_token);
        this.m_clientData = await getClientWithUserdata(userData);
        // console.log(`${this.m_clientData.username} connected!`);
        updateClient(this.m_clientData._id, {
            $set:{
                status: 0
            }
        });
    }

    joinGame(_gameInstance: GameLobby): void{
        if(Boolean(this.m_currentGameLobby)) this.leaveGame();

        this.m_currentGameLobby = _gameInstance;
        this.m_currentGameLobby.onPlayerJoin(this);
        this.m_socket.join(_gameInstance.m_roomCode);
    }

    leaveGame(): boolean{
        if(!Boolean(this.m_currentGameLobby)) return false;

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

class GameLobby{
    m_leader: Client;
    m_roomCode: string;
    m_playersInRoom: {[socketId: string]: Client} = {};
    m_io: socketio.Server;
    m_isGameInProgress: boolean;
    m_roomSeed: number;
    
    constructor(_leader: Client, _roomName: string, _io: socketio.Server){
        this.m_leader = _leader;
        this.m_io = _io;
        this.m_roomCode = _roomName;
        this.m_roomSeed = Math.random();
    }

    startGame(){
        this.m_isGameInProgress = true;
        this.emit('gameCountdown');
    }

    onPlayerLeave(_player: Client){
        this.emit('playerLeave', {socketId: _player.m_socketId});
        delete(this.m_playersInRoom[_player.m_socketId]);
        if(this.m_isGameInProgress){
            this.emit('gameEnd', {
                scores: []
            });
        }
        // console.log(`${_player.m_clientData.username} left room ${this.m_roomCode}!`);
    }

    onPlayerJoin(_player: Client){
        this.emit('playerJoin', {
            socketId: _player.m_socketId,
            userInfo: _player.getLiteData()
        })
        this.m_playersInRoom[_player.m_socketId] = _player;
        if(Object.keys(this.m_playersInRoom).length > 1) this.startGame();
        // console.log(`${_player.m_clientData.username} joined room ${this.m_roomCode}!`);
    }

    getRoomData(){
        let playersData = {};
        for(let key in this.m_playersInRoom){
            playersData[key] = this.m_playersInRoom[key].getLiteData();
        }
        return {
            roomCode: this.m_roomCode,
            leaderId: this.m_leader.m_socketId,
            players: playersData
        }
    }

    emit(_event: string, _data?: any){
        this.m_io.to(this.m_roomCode).emit(_event, _data);
    }
}

export { Client, GameLobby }
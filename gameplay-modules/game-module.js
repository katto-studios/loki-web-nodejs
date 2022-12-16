const wordsList = require('./words-list');
const Random = require('seedrandom');

class GameManager{
    static clients = [];
    static socketIO;

    static initalizeManager(server){
        this.socketIO =  require('socket.io')(server);
        this.socketIO.on('connection', (client)=>{
            this.clients.push(new ClientInstance(client));
        });
    }
}

class GameInstance{
    MAX_GAME_TIME = 15;
    WORDS_LIMIT = 30;
	VALIDCHARS="abcdefghijklmnopqrstuvwxyz .,"
  
    wordsToType;
    canType = false;
    currentWordsDisplay;
    currentWordsPtr = 0;

    correctCharIndexes = [];
    wrongCharIndexes = [];

    constructor(instanceId){
        this.gameInstanceId = instanceId;
        this.wordsToType = this.getWords();
        this.currentWordsDisplay = this.wordsToType;
    }

    onKeyDown(key){
        if(!this.VALIDCHARS.includes(key)) return;
        let isRight = key === this.wordsToType.charAt(this.currentWordsPtr);
        if(isRight){
            this.correctCharIndexes.push(this.currentWordsPtr);
        }else{
            this.wrongCharIndexes.push(this.currentWordsPtr);
        }
        this.currentWordsPtr++;
        this.updateWordsToDisplay();

        GameManager.socketIO.to(this.gameInstanceId).emit('onGetNewWords', this.currentWordsDisplay);
    }

    updateWordsToDisplay(){
        this.currentWordsDisplay = '';
        for(let count = 0; count < this.wordsToType.length; count++){
            if(count === this.currentWordsPtr){
                this.currentWordsDisplay += `<span class="current">${this.wordsToType[count]}</span>`;
            }else if(this.wrongCharIndexes.includes(count)){
                this.currentWordsDisplay += `<span class="wrong">${this.wordsToType[count]}</span>`;
            }else{
                this.currentWordsDisplay += this.wordsToType[count];
            }
        }
    }

    getWords(){
        let returnMe = '';
        let rng = new Random();
        for(let count = 0; count < this.WORDS_LIMIT; count++){
            returnMe += wordsList.wordList[Math.round(rng() * (wordsList.wordList.length - 1))].slice(0, -1) + ' ';
        }
        return returnMe.trimEnd();
    }
}

class ClientInstance{
    constructor(socket){
        this.socket = socket;
        this.currentGameInstance = new GameInstance(socket.id);
        GameManager.socketIO.to(socket.id).emit('onGetNewWords', this.currentGameInstance.wordsToType);

        socket.on('disconnect', () => this.onDisconnect());
        socket.on('keydown', (key) => this.onKeyDown(key));
    }

    onDisconnect(){

    }

    onKeyDown(key){
        this.currentGameInstance.onKeyDown(key);
    }
}

module.exports = {
    GameManager, GameInstance
}
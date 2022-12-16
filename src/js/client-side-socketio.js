const socket = io({
    autoConnect: false
});

function lobbyView() { 
    return `
    <div class="nav" id="lobby">
        <h1>Multiplayer</h1>
        <br>
        <h2>Matchmaking</h2>
        <br>
        <a href="#" onclick="joinQueue()" id="btn-quick-match">Quick Match</a>
        <a href="#" onclick="">Ranked (Coming Soon)</a>
        <br>
        <br>
        <h2>Private Match</h2>
        <input type="text" id="room-code-input"/>
        <a href="#" onclick="joinRoom()">Join room</a>
        <a href="#" onclick="createRoom()">Create room</a>
    </div>`
}

function waitingView(roomCode) {
    return `
    <div class="nav" id="waiting">
        <h1>Waiting for Opponent<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></h1>
        <h2 id="room-code">Room Code: ${roomCode}</h2>
        <button onclick="leaveRoom()">Leave</button>
        <button onclick="onInviteFriend()">Invite</button>
    </div>`;
}

function countDownView(otherPlayerId){
    return `
    <div style="margin:auto">
        <h4>Challenge Starts In</h4>
        <h1 id='countdown'>5</h1>
        <br>
        <iframe src="/user-small?id=${otherPlayerId}"></iframe>
    </div>`
}

function endGameView(result){
    let didC1Win = result.c1ScoreData.score > result.c2ScoreData.score
    let winnerUserData = didC1Win ? roomData.c1.userData : roomData.c2.userData;
    let winnerScoreData = didC1Win ? result.c1ScoreData : result.c2ScoreData;
    let loserUserData = didC1Win ? roomData.c2.userData : roomData.c1.userData;
    let loserScoreData = didC1Win ? result.c2ScoreData : result.c1ScoreData;
    return `
    <div style="margin:auto">
        <h4>Results:</h4>
        <h1>✨${winnerUserData.username} won✨</h1>
        <div style="display:grid; grid-template-columns:1fr 1fr; grid-gap:10px; grid-gap:30px">
        ${endGameScoreView(winnerUserData, winnerScoreData)}
        ${endGameScoreView(loserUserData, loserScoreData)}
        </div>
        <br>
        <button id="rematch-btn" onclick="rematch()">Rematch?</button>
    </div>`
}

function endGameScoreView(userData, scoreData){
    return `<div><iframe src="/user-small?id=${userData._id}"></iframe>
    <br>
    <br>
    <div class="stats">
        <h1>
        ${scoreData.score}
        </h1>
        <p>SCORE</p>
    </div>
    <div class="stats">
        <h1>
        ${scoreData.wpm}
        </h1>
        <p>WPM</p>
    </div>
    <div class="stats">
        <h1>
        ${scoreData.maxcombo}
        </h1>
        <p>MAX COMBO</p>
    </div>
    <div class="stats">
        <h1>
        ${scoreData.errors}
        </h1>
        <p>ERRORS</p>
    </div>
    <br>
    <br>
    <br>
    <a href="/users?id=${userData._id}" target="_blank">View Profile</a>
    <br>
    <br></div>`
}

var roomCode = '';
var roomData = false;
var isCreatedByMe = false;
var queueTimer = false;
var currentQueueTime = -1;

window.addEventListener('load', ()=>{
    if(!clientInfoForTheEvent){
        eOnAuthenticated.push(connectToServer);
    }else{
        connectToServer(clientInfoForTheEvent);
    }
});

function changeView(view){
    document.getElementById('multiplayer-view-container').innerHTML = view;
}

function onLoadMultiplayerLobby(){
    changeView(lobbyView());
}

function connectToServer(client){
    socket.connect();
    eOnCloseAll.push(() =>{
        if(queueTimer){
            if(!roomData) socket.emit('forceLeaveQueue');
            cancelQueueTimer();
        }
    });

    socket.on('connect', () =>{
        socket.emit('authDetails', authedClient.getAuthResponse().id_token, authSuccess =>{});
    });

    socket.on('playerJoin', data =>{
        // console.log(`Player ${data.userData.username} joined!`);
        roomData.c2 = data;
    });

    socket.on('playerLeave', data =>{
        // console.log(`Player ${data.userData.username} left!`);
        delete(roomData.players[data.socketId]);
    });

    socket.on('gameCountdown', ()=>{
        gameCountdown();
    });
    
    socket.on('gameStart', () =>{
        gameStart();
    });

    socket.on('gameEnd', data =>{
        gameEnd(data);
    });

    socket.on('forceGameEnd', () =>{
        opponentLeft();
    })

    socket.on('updatePlayerCursors', data =>{
        getUpdateOfPlayerCursor(data);
    });

    socket.on('getScore', (_, ack) =>{
        ack(getScore());
    });

    socket.on('showPopup', data => {
        showPopup(data.message, data.delay);
    });

    socket.on('matchFound', data =>{
        cancelQueueTimer();
        disableNavBar();
        roomData = data.roomData;
        isCreatedByMe = data.isHost;
        queueTimer = false;
        socket.emit('ready');
    });
}

function cancelQueueTimer(){
    if(queueTimer) clearTimeout(queueTimer);
    $('#btn-quick-match').html('Quick match');
}

function joinQueue(){
    socket.emit('joinQueue', {}, ack =>{
        currentQueueTime = 0;
        if(ack.isInQueue){
            // console.log('Joined queue!');
            $('#btn-quick-match').html(`${new Date(currentQueueTime * 1000).toISOString().substr(11, 8)}`);
            queueTimer = setInterval(() => {
                currentQueueTime += 1;
                $('#btn-quick-match').html(`${new Date(currentQueueTime * 1000).toISOString().substr(11, 8)}`);
            }, 1000);
        }else{
            // console.log('Left queue!');
            cancelQueueTimer();
        }
    });
}

function getScore(){
    return {
        wordObjects: Game.wordObjects
    }
}

function createRoom(){
    socket.emit('createRoom', {}, ack =>{
        // console.log(`Room created with code: ${ack}!`);
        enableNavBar();
        roomData = ack;
        socket.emit('ready');
        changeView(waitingView(ack.roomCode));
        isCreatedByMe = true;
    });
}

function acceptFriendInvite(roomCode){
    forceHidePopup();
    switchToMultiplayer();
    joinRoomManual(roomCode);
}

function joinRoom(){
    let joinValue = $('#room-code-input').val().toUpperCase();
    joinRoomManual(joinValue);
}

function joinRoomManual(roomCode){
    socket.emit('joinRoom', roomCode, ack =>{
        if(ack.success){
            isCreatedByMe = false;
            roomData = ack.roomInstance;
            socket.emit('ready');
            disableNavBar();
        }else{
            console.log(`Room ${roomCode} not found!`);
        }
    });
}

function leaveRoom(){
    if(!roomData) return;
    socket.emit('leaveRoom', {}, ack =>{
        // console.log(ack);
        if(ack){
            roomData = false;
            changeView(lobbyView());
        }
    });
}

function gameCountdown(){
    //p1 v p2, seed are all in roomData
    try{ MicroModal.close('modal-friends-online'); } catch{}
    let thisId = isCreatedByMe ? roomData.c2.userData._id : roomData.c1.userData._id;
    changeView(countDownView(thisId));
    startTimer();
}

function startTimer(){
	let countDownTimer = 5;
	let countDownElement = document.getElementById('countdown');	
	let x = setInterval(function() {
		countDownTimer--;
		countDownElement.innerHTML = countDownTimer;
		if(countDownTimer <= 0){
			clearInterval(x);
		}
	}, 1000);
};

function gameStart(){
    //start game
    //console.log(`Game start with players ${roomData.c1.userData.username} and ${roomData.c2.userData.username}`);
    // socket.emit('getWords', 3, words =>{
    //      console.log(words);
    // });

    let thisId = isCreatedByMe ? roomData.c2.userData._id : roomData.c1.userData._id;

    document.getElementById('other-player-small-container').innerHTML = `
    <iframe src="/user-small?id=${thisId}"></iframe>`;
    
    switchToMultiplayerGame();
}

function getMultiplayerWordsInOneGo(count){
    return new Promise((resolve, reject)=>{
        socket.emit('getWords', count, words => {
            resolve(words);
        })
    })
}

function getMultiplayerWords() {
    return new Promise((resolve, reject)=>{
        socket.emit('getWords', 1, words => {
            resolve(words[0]);
        })
    })
}

function gameEnd(data){
    switchToMultiplayer();
    changeView(endGameView(data));
    enableNavBar();
}

function opponentLeft(){
    showPopup('Opponent left!', 2000);
    switchToMultiplayer();
    enableNavBar();
}

function sendUpdateOfPlayerCursor(line, word, index){
    socket.emit('updatePlayerCursors', {line, word, index});
}

function getUpdateOfPlayerCursor(data){
    Game.otherPlayerCursorData = data;
    // console.log(Game.otherPlayerCursorData);  
    Game.renderWords();
}

function rematch(){
    enableNavBar();
    socket.emit('ready');
    $('#rematch-btn').attr('onclick','');
    $('#rematch-btn').html('Waiting For Rematch...');
}
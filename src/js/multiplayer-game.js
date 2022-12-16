function reloadMultiplayerGame(){
	Game = new MultiplayerGameClass();
	Game.init(this);
	try{
		MicroModal.close();
	}catch{}
}

const UPDATE_TICKER_INTERVAL = 0.25;

class MultiplayerGameClass{
	wordObjects = [];
	currentRowIndex = 0;

	charIndex = 0;
	wordIndex = 0;
	rowIndex = 0;

	started = true;
	canType = true;

	combo = 0;
	comboTimer = 1.0;
	maxcombo = 0;

	timer = 0;
	startTime = 15;

	correctChars = 0;
	correctWordsReactionBuffer = [];
	correctWordsBuffer = [];
	correctWordsAverageReactionTimes = [];
	correctWords = [];
	correctWordsCombo = [];
	accuracyAccumulative = [];

	score = 0;

	VALIDCHARS="abcdefghijklmnopqrstuvwxyz .,"

	parent = false;

	updateTicker = UPDATE_TICKER_INTERVAL;

	otherPlayerCursorData = [];

	onKeyDown = (key) => {
		const _0x5a2d=['started','score','finishRow','23765JQDvQi','includes','char','1anvzAT','342868LPiCod','16001xEkkGo','backspace','11SCTiSB','renderWords','maxcombo','CORRECT','wordObjects','charIndex','timeTaken','toLowerCase','comboTimer','floor','7qnxEkE','wordIndex','1377MdyDzW','11FsTcWj','state','260xMaoLK','correctChars','31072aUeoXo','length','VALIDCHARS','UNTYPED','WRONG','characters','Tab','4442lAnKEj','log','combo','112921NVTsAj'];const _0x245fb8=_0x16e3;(function(_0x234159,_0x131872){const _0x4fcf0f=_0x16e3;while(!![]){try{const _0x3ff538=parseInt(_0x4fcf0f(0x13e))*parseInt(_0x4fcf0f(0x123))+-parseInt(_0x4fcf0f(0x12d))*parseInt(_0x4fcf0f(0x126))+parseInt(_0x4fcf0f(0x140))*parseInt(_0x4fcf0f(0x13d))+parseInt(_0x4fcf0f(0x12f))*-parseInt(_0x4fcf0f(0x13b))+parseInt(_0x4fcf0f(0x131))*-parseInt(_0x4fcf0f(0x142))+parseInt(_0x4fcf0f(0x12e))+parseInt(_0x4fcf0f(0x12a));if(_0x3ff538===_0x131872)break;else _0x234159['push'](_0x234159['shift']());}catch(_0x64b368){_0x234159['push'](_0x234159['shift']());}}}(_0x5a2d,0x327cb));if(key==_0x245fb8(0x122))reloadGame();function _0x16e3(_0x4bc30f,_0x3b7cc1){_0x4bc30f=_0x4bc30f-0x121;let _0x5a2d97=_0x5a2d[_0x4bc30f];return _0x5a2d97;}key=key[_0x245fb8(0x138)]();if(!this[_0x245fb8(0x144)][_0x245fb8(0x12b)](key)&&key!=_0x245fb8(0x130)||!this['canType'])return;if(!this[_0x245fb8(0x127)])key===this[_0x245fb8(0x135)][0x0][0x0][_0x245fb8(0x121)][0x0][_0x245fb8(0x12c)]&&(this[_0x245fb8(0x127)]=!![],this[_0x245fb8(0x136)]=0x1,this[_0x245fb8(0x132)]());else{let currentRow=this[_0x245fb8(0x135)][this['rowIndex']],currentWord=currentRow[this[_0x245fb8(0x13c)]],currentChar=currentWord[_0x245fb8(0x121)][this['charIndex']];currentChar[_0x245fb8(0x137)]=this[_0x245fb8(0x139)],console[_0x245fb8(0x124)](key);if(key===_0x245fb8(0x130)){console[_0x245fb8(0x124)]('bp');this[_0x245fb8(0x136)]>0x0&&(this[_0x245fb8(0x136)]--,this[_0x245fb8(0x132)]());return;}if(currentChar[_0x245fb8(0x12c)]==='\x20'&&key!='\x20')return;if(key==='\x20'&&currentChar[_0x245fb8(0x12c)]!='\x20'&&this[_0x245fb8(0x136)]!=0x0){this['charIndex']=0x0;this[_0x245fb8(0x13c)]==currentRow['length']-0x1?(this[_0x245fb8(0x13c)]=0x0,this['finishRow']()):this['wordIndex']++;this[_0x245fb8(0x132)]();return;}if(currentChar[_0x245fb8(0x13f)]===charState[_0x245fb8(0x145)]){if(key===currentChar['char']){currentChar[_0x245fb8(0x13f)]=charState[_0x245fb8(0x134)],this[_0x245fb8(0x128)]+=Math[_0x245fb8(0x13a)](this['comboTimer']*this['combo']),this['comboTimer']=0x1,this['combo']++;if(this[_0x245fb8(0x125)]>this[_0x245fb8(0x133)])this[_0x245fb8(0x133)]=this[_0x245fb8(0x125)];this[_0x245fb8(0x141)]++;}else currentChar[_0x245fb8(0x13f)]=charState[_0x245fb8(0x146)],this['combo']=0x0;}else currentChar[_0x245fb8(0x13f)]===charState[_0x245fb8(0x146)]&&(key===currentChar[_0x245fb8(0x12c)]?currentChar['state']=charState['UNTYPED']:(currentChar[_0x245fb8(0x13f)]=charState[_0x245fb8(0x146)],this[_0x245fb8(0x125)]=0x0));this[_0x245fb8(0x136)]==currentWord[_0x245fb8(0x121)][_0x245fb8(0x143)]-0x1?(this[_0x245fb8(0x136)]=0x0,this['wordIndex']==currentRow[_0x245fb8(0x143)]-0x1?(this[_0x245fb8(0x13c)]=0x0,this[_0x245fb8(0x129)]()):this[_0x245fb8(0x13c)]++):this['charIndex']++,this[_0x245fb8(0x132)]();}
	}

	finishRow = () => {
		getMultiplayerWords().then((res, rej) => {
			let newRow = res.map(word => new Word(word));
			this.wordObjects.push(newRow);
		}).then(()=>{
			this.rowIndex++;
			console.log(this.wordObjects);
			this.renderWords();
		})
	}

	renderWords = () => {
		let wordString = "";
		for(let i = this.rowIndex; i < this.rowIndex + 3; i++){
			wordString += `<span id='row-${i}' class='row'>`
			let thisRow = this.wordObjects[i];
			for(let j = 0; j < thisRow.length; j++){
				let thisWord = thisRow[j];
				for(let k = 0; k < thisWord.characters.length; k++){
					let thisChar = thisWord.characters[k];
					if(i == this.rowIndex && j == this.wordIndex && k == this.charIndex){
						wordString += "<span class='current'>" + thisChar.char + "</span>";
					}else if (i == this.otherPlayerCursorData.line && j == this.otherPlayerCursorData.word && k == this.otherPlayerCursorData.index){
						wordString += "<span class='current-other-player'>" + thisChar.char + "</span>";
					}else {
						switch (thisChar.state){
							case charState.WRONG:
								wordString += "<span class='wrong'>" + thisChar.char + "</span>";
								break;
							default:
								wordString += thisChar.char;
								break;
						}
					}
				}
			}
			wordString += "</span>"
			wordString += "<br>";
		}
		this.words.innerHTML = wordString;
	}

	init = (parent) =>{
		getMultiplayerWordsInOneGo(3)
			.then(resArr =>{
				resArr.forEach(row =>{
					let newRow = row.map(word => new Word(word));
					this.wordObjects.push(newRow);
				});
			})
			.then(() =>{
				console.log('Initalized game!');
				this.parent = parent;
				this.words = document.getElementById("words");
				this.comboElement = document.getElementById("combo");
				this.metreVal = document.getElementById("metre-val");
				this.timeElement = document.getElementById("time");
				this.scoreElement = document.getElementById("score");
				this.timer = this.startTime;
				if(this.words.innerHTML != ""){
					this.wordsToType = this.words.innerHTML.toString();
				}
				this.wordsToType = this.wordsToType.toLowerCase().trimStart().trimEnd().replace(/\s/g, " ");
				this.renderWords();
				//console.log(this.wordsToType);
				
				window.requestAnimationFrame(loop);
			});
	}

	insertNewRow = () => {
		console.log(insertNewRow);
		return getMultiplayerWords()
			.then(result => {
				let newRow = result.map(word => new Word(word));
				this.wordObjects.push(newRow);
			});
	}

	// getNewWords = () => {
	// 	return new Promise((resolve, reject) =>{
	// 		$.get(`/user-api/multi-words`, {roomData.seed}, responseData =>{
	// 			resolve(responseData);
	// 		});
	// 	});
	// }

	// getNewWordsInOneGo = (count) => {
	// 	return new Promise((resolve, reject) =>{
	// 		$.get(`/user-api/multi-words`, {roomData.seed, count}, responseData =>{
	// 			resolve(responseData);
	// 		});
	// 	});
	// }

	forceStop = () => {
		this.started = false;
	}

	update = (progress) =>{
		if(!this.started) return;
		this.comboTimer -= progress;
		this.timer -= progress;
		if(this.comboTimer < 0){
			this.combo = 0;
		}

		this.updateTicker -= progress;
		if(this.updateTicker <= 0){
			sendUpdateOfPlayerCursor(this.rowIndex, this.wordIndex, this.charIndex);
			this.updateTicker = UPDATE_TICKER_INTERVAL;
		}

		if(this.timer <= 0 && this.canType){
			// //Done with game
			// this.canType = false;
			// this.started = false;

			// this.drawChart();

			// var wpm = Math.ceil(this.correctChars * (60/this.startTime) / 5);

			// parent.handleEndGame({
			// 	score: this.score,
			// 	wpm: wpm,
			// 	wordObjects: this.wordObjects,
			// }).then(result => {
			// 	MicroModal.show('modal-report');

			// 	document.getElementById("final-score-data").innerHTML = `<h1>🎉Score: ${result.serverScore}</h1>
			// 	<h3>⏲WPM: ${result.serverWpm}</h3>
			// 	<h3>💥Max Combo: ${this.maxcombo}</h3>
			// 	<h3>💰Scrap Earned: ${result.coinsToAdd}</h3>`;
			// }).catch(err=>{
			// 	MicroModal.show('modal-report');

			// 	document.getElementById("final-score-data").innerHTML = `<h1>🎉Score: ${this.score}</h1>
			// 	<h3>⏲WPM: ${wpm}</h3>
			// 	<h3>💥Max Combo: ${this.maxcombo}</h3>`;
			// });
		}
	}

	draw = () =>{
		this.comboElement.innerHTML = `COMBO:${this.combo}`;
		this.metreVal.style.width = `${this.comboTimer * 100}%`
		this.timeElement.innerHTML = `${Math.ceil(this.timer)}s`;
	}

	drawChart = () =>{
		let correctWords = 0;
		let wrongWords = 0;

		for(let i = 0; i < this.wordObjects.length; i++){
			let thisRow = this.wordObjects[i];
			for(let j = 0; j < thisRow.length; j++){
				let thisWord = thisRow[j];
				let isTyped = false;
				let isCorrect = true;
				let totalReactionTime = 0;
				for(let k = 0; k < thisWord.characters.length; k++){
					let thisChar = thisWord.characters[k];
					switch(thisChar.state){
						case charState.CORRECT:
							isTyped = true;
							totalReactionTime += thisChar.timeTaken;
							break;
						case charState.WRONG:
							totalReactionTime += thisChar.timeTaken;
							isTyped = true;
							isCorrect = false;
							break;
					}
				}
				if(isTyped){
					console.log(thisWord.getWord());

					if(isCorrect) correctWords++;
					else wrongWords++;

					this.correctWords.push(thisWord.getWord());
					this.accuracyAccumulative.push(Math.floor(Math.max(0, correctWords/(correctWords + wrongWords))*100));
					this.correctWordsAverageReactionTimes.push(Math.floor(Math.max(0, totalReactionTime/thisWord.characters.length)*100));
				}
			}
		}

		//console.log(`${this.correctChars} and ${this.correctCharReactionTimes}`);
		var ctx = document.getElementById('myChart').getContext('2d');
		var chart = new Chart(ctx, {
			// The type of chart we want to create
			type: 'line',

			// The data for our dataset
			data: {
				labels: this.correctWords,
				datasets: [{
					label: 'Speed Score',
					borderColor: '#e09c47',
					data: this.correctWordsAverageReactionTimes
				},{
					label: 'Accuracy Score',
					borderColor: '#c94b4b',
					data: this.accuracyAccumulative
				}]
			},

			// Configuration options go here
			options: {
				responsive: true
			}
		});
	}
}

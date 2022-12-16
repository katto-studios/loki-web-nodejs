// Removes instance of item from an array
function remove(arr) {
    let what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

function reloadGame(){
	Game = new GameClass();
	Game.init(this);
	document.querySelector('#other-player-small-container').innerHTML = '';
	try{
		MicroModal.close();
	}catch{}
}

const charState = {
	UNTYPED: 0,
	CORRECT: 1,
	WRONG: 2,
	CORRECTED: 3
}

class Character{
	char = "";
	timeTaken = 0;
	state = charState.UNTYPED;

	constructor(char){
		this.char = char;
	}
}

class Word{
	characters = [];
	timeTaken = 0;
	wrongChars = [];
	typed = false;

	getWord = () => {
		let word = '';
		this.characters.forEach((character)=>{
			word += character.char;
		});
		return word;
	}

	constructor(word){
		let rawCharacters = Array.from(word).forEach((rawChar)=>this.characters.push(new Character(rawChar)));
	}
}

class GameClass{
	wordObjects = [];
	currentRowIndex = 0;

	charIndex = 0;
	wordIndex = 0;
	rowIndex = 0;

	started = false;
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

	onKeyDown = (key) => {
		const _0x1b7f=['includes','305969MwvmBr','started','1jePwxx','643010SpLaAU','comboTimer','timeTaken','log','characters','wordIndex','charIndex','1516018MgQVEH','1URYhyw','state','maxcombo','renderWords','finishRow','WRONG','1umtoAR','combo','wordObjects','100070qGPYgZ','405087CLNcOn','floor','length','1Xcftdw','856546OdFJlF','Tab','rowIndex','char','553562Dgzhdf','VALIDCHARS','UNTYPED'];const _0x51435d=_0x18e2;(function(_0x106a09,_0x231f6d){const _0x4bc8b5=_0x18e2;while(!![]){try{const _0xe479b0=parseInt(_0x4bc8b5(0x83))+parseInt(_0x4bc8b5(0x9f))+-parseInt(_0x4bc8b5(0x8b))*-parseInt(_0x4bc8b5(0x96))+parseInt(_0x4bc8b5(0x8e))*parseInt(_0x4bc8b5(0x82))+parseInt(_0x4bc8b5(0x87))*parseInt(_0x4bc8b5(0x9c))+-parseInt(_0x4bc8b5(0xa0))*parseInt(_0x4bc8b5(0x8d))+-parseInt(_0x4bc8b5(0x95));if(_0xe479b0===_0x231f6d)break;else _0x106a09['push'](_0x106a09['shift']());}catch(_0x502ef1){_0x106a09['push'](_0x106a09['shift']());}}}(_0x1b7f,0x835c4));if(key==_0x51435d(0x84))reloadGame();function _0x18e2(_0x34010b,_0x226228){_0x34010b=_0x34010b-0x81;let _0x1b7f47=_0x1b7f[_0x34010b];return _0x1b7f47;}key=key['toLowerCase']();if(!this[_0x51435d(0x88)][_0x51435d(0x8a)](key)&&key!='backspace'||!this['canType'])return;if(!this[_0x51435d(0x8c)])key===this[_0x51435d(0x9e)][0x0][0x0][_0x51435d(0x92)][0x0][_0x51435d(0x86)]&&(this['started']=!![],this[_0x51435d(0x94)]=0x1,this[_0x51435d(0x99)]());else{let currentRow=this[_0x51435d(0x9e)][this[_0x51435d(0x85)]],currentWord=currentRow[this[_0x51435d(0x93)]],currentChar=currentWord['characters'][this[_0x51435d(0x94)]];currentChar[_0x51435d(0x90)]=this[_0x51435d(0x8f)],console[_0x51435d(0x91)](key);if(key==='backspace'){console['log']('bp');this[_0x51435d(0x94)]>0x0&&(this[_0x51435d(0x94)]--,this[_0x51435d(0x99)]());return;}if(currentChar['char']==='\x20'&&key!='\x20')return;if(key==='\x20'&&currentChar['char']!='\x20'&&this['charIndex']!=0x0){this[_0x51435d(0x94)]=0x0;this[_0x51435d(0x93)]==currentRow[_0x51435d(0x81)]-0x1?(this[_0x51435d(0x93)]=0x0,this[_0x51435d(0x9a)]()):this[_0x51435d(0x93)]++;this['renderWords']();return;}if(currentChar['state']===charState[_0x51435d(0x89)]){if(key===currentChar[_0x51435d(0x86)]){currentChar[_0x51435d(0x97)]=charState['CORRECT'],this['score']+=Math[_0x51435d(0xa1)](this['comboTimer']*this['combo']),this['comboTimer']=0x1,this[_0x51435d(0x9d)]++;if(this[_0x51435d(0x9d)]>this[_0x51435d(0x98)])this[_0x51435d(0x98)]=this[_0x51435d(0x9d)];this['correctChars']++;}else currentChar[_0x51435d(0x97)]=charState[_0x51435d(0x9b)],this[_0x51435d(0x9d)]=0x0;}else currentChar[_0x51435d(0x97)]===charState[_0x51435d(0x9b)]&&(key===currentChar[_0x51435d(0x86)]?currentChar[_0x51435d(0x97)]=charState[_0x51435d(0x89)]:(currentChar[_0x51435d(0x97)]=charState[_0x51435d(0x9b)],this[_0x51435d(0x9d)]=0x0));this[_0x51435d(0x94)]==currentWord['characters']['length']-0x1?(this[_0x51435d(0x94)]=0x0,this[_0x51435d(0x93)]==currentRow[_0x51435d(0x81)]-0x1?(this[_0x51435d(0x93)]=0x0,this['finishRow']()):this['wordIndex']++):this[_0x51435d(0x94)]++,this[_0x51435d(0x99)]();}
	}

	finishRow = () => {
	
		this.rowIndex++;
		this.renderWords();

		this.getNewWords().then((res, rej) => {
			let newRow = res.map(word => new Word(word));
			this.wordObjects.push(newRow);
		}).then(()=>{
			// console.log(this.wordObjects);
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
					} else {
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
		this.getNewWordsInOneGo(4)
			.then(resArr =>{
				resArr.forEach(row =>{
					let newRow = row.map(word => new Word(word));
					this.wordObjects.push(newRow);
				});
			})
			.then(() =>{
				// console.clear();
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
		return this.getNewWords()
			.then(result => {
				let newRow = result.map(word => new Word(word));
				this.wordObjects.push(newRow);
			});
	}

	getNewWords = () => {
		return new Promise((resolve, reject) =>{
			$.get(`/user-api/random-words`, {}, responseData =>{
				resolve(responseData);
			});
		});
	}

	getNewWordsInOneGo = (count) => {
		return new Promise((resolve, reject) =>{
			$.get(`/user-api/random-words`, {count}, responseData =>{
				resolve(responseData);
			});
		});
	}

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

		if(this.timer <= 0 && this.canType){
			//Done with game
			this.canType = false;
			this.started = false;

			this.drawChart();

			var wpm = Math.ceil(this.correctChars * (60/this.startTime) / 5);

			parent.handleEndGame({
				score: this.score,
				wpm: wpm,
				wordObjects: this.wordObjects,
			}).then(result => {
				MicroModal.show('modal-report');

				document.getElementById("final-score-data").innerHTML = `<h1>🎉Score: ${result.serverScore}</h1>
				<h3>💰Scrap Earned: ${result.coinsToAdd}</h3>
				<br>
				<div class="stats">
					<h1>
					${result.serverWpm}
					</h1>
					<p>WPM</p>
				</div>
				<div class="stats">
					<h1>
					${result.serverMaxcombo}
					</h1>
					<p>MAX COMBO</p>
				</div>
				<div class="stats">
					<h1>
					${result.serverErrors}
					</h1>
					<p>ERRORS</p>
				</div>
				`;

				//update scrap in nav bar
				addScrapVisual(result.coinsToAdd);
			}).catch(err=>{
				MicroModal.show('modal-report');

				document.getElementById("final-score-data").innerHTML = `<h1>🎉Score: ${this.score}</h1>
				<h3>⏲WPM: ${wpm}</h3>
				<h3>💥Max Combo: ${this.maxcombo}</h3>`;
			});
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

var Game = new GameClass();
var lastRender = 0;

function loop(timestamp) {
	let progress = (timestamp - lastRender) / 1000; //Delta time in Seconds

	Game.update(progress);
	Game.draw();

	lastRender = timestamp;
	window.requestAnimationFrame(loop);
}
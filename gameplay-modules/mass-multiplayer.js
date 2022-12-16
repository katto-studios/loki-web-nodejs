const wordsList = require('./words-list');
const random = require('seedrandom');
const CHAR_LIMIT = 47;

function getRoundedDate(minutes, d = new Date()) {
	let ms = 1000 * 60 * minutes; // convert minutes to ms
	let roundedDate = new Date(Math.round(d.getTime() / ms) * ms);

	return roundedDate
}

function stringToNum(inputString) {
	let result = 1;
	for(var i = 0; i < inputString.length; i++){
		result += inputString.toUpperCase().charCodeAt(i) * i;
	}
	return result;
}

async function getRoomWords(roomCode){
	let roundedDate = getRoundedDate(1, new Date()).valueOf();
	let seed = (roundedDate * stringToNum(roomCode))/100000;
	let rng = new random(seed);
	let result = [];
	let length = 0;
	let gonext = true;
	//console.log(`seed=${seed}`);

	do{
		let nextWord = `${(wordsList.wordList[Math.round(rng() * (wordsList.wordList.length - 1))]).trimEnd(1)} `;
		gonext = (length + nextWord.length) <= 47;
		if(gonext){
			result.push(nextWord);
			length += nextWord.length;
		}
	} while (gonext); //47 Character Limit

	return result;
}

function* randomWordsGenerator(seed){
	const CHAR_LIMIT = 47;
	let rng = new random(seed);
	while (true) {
		let yieldMe = [];
		let currentLength = 0;
		let goNext = true;
		while(goNext){
			let nextWord = `${(wordsList.wordList[Math.round(rng() * (wordsList.wordList.length - 1))]).trimEnd(1)} `;
			goNext = currentLength + nextWord.length <= CHAR_LIMIT;
			if(goNext){
				yieldMe.push(nextWord);
				currentLength += nextWord.length;
			}
		}
		yield yieldMe;
	}
}

function scrubLines(lines){
	let isOneAndTwo = false;
	if(lines[0].length === lines[1].length){
		isOneAndTwo = true;
		for(let count = 0; count < lines[0].length; count++){
			if(lines[0][count] !== lines[1][count]){
				isOneAndTwo = false;
				break;
			}
		}
	}
	//Check 1 & 3
	let isOneAndThree = false;
	if(lines[0].length === lines[2].length){
		isOneAndThree = true;
		for(let count = 0; count < lines[0].length; count++){
			if(lines[0][count] !== lines[2][count]){
				isOneAndThree = false;
				break;
			}
		}
	}
	//Check 2 & 3
	let isTwoAndThree = false;
	if(lines[1].length === lines[2].length){
		isTwoAndThree = true;
		for(let count = 0; count < lines[1].length; count++){
			if(lines[1][count] !== lines[2][count]){
				isTwoAndThree = false;
				break;
			}
		}
	}

	if(isOneAndTwo && isOneAndThree && isTwoAndThree){
		//It's over
		let newPromiseArr = [];
		lines.forEach(x => {
			newPromiseArr.push(getRoomWords(Math.random().toString()))
		});
		return Promise.all(newPromiseArr)
			.then(res =>{
				return scrubLines(res)
			})
	}else if(isOneAndTwo){ //here we go
		return getRoomWords(Math.random().toString())
			.then(line =>{
				lines[1] = line;
				return scrubLines(lines);
			})
	}else if(isOneAndThree){
		return getRoomWords(Math.random().toString())
			.then(line =>{
				lines[2] = line;
				return scrubLines(lines);
			})
	}else if(isTwoAndThree){
		return getRoomWords(Math.random().toString())
			.then(line =>{
				lines[2] = line;
				return scrubLines(lines);
			})
	}else{
		//its clean
		return lines;
	}	
}

module.exports = {
	getRoomWords, scrubLines, randomWordsGenerator
};
const fs = require('fs');

var wordList = [];

function init(){
	var rawWordList = fs.readFileSync(__dirname + "/word-lists/Words.txt").toString();
	this.wordList = rawWordList.split("\n");
	this.wordList.forEach(word => {
		word = word.trimEnd().trimStart();
	});
	console.log(`Words List Initialised, ${this.wordList.length} words found`);
}

module.exports = {
	init, wordList
}
const gameTime = 15;    //15 seconds

function getScoreData(gameData){
    let combo = 0;
    let score = 0;
    let correctChars = 0;
    let errors = 0;
    let maxcombo = 0;

    for(let i = 0; i < gameData.wordObjects.length; i++){
        let thisRow = gameData.wordObjects[i];
        for(let j = 0; j < thisRow.length; j++){
            let thisWord = thisRow[j];
            for(let k = 0; k < thisWord.characters.length; k++){
                let thisChar = thisWord.characters[k];
                switch(thisChar.state.toString()){
                    case '1':
                        if(thisChar.timeTaken <= 0){
                            combo = 0;
                            break;
                        }
                        score += Math.floor(thisChar.timeTaken * combo);
                        combo++;
                        correctChars++;
                        if(combo > maxcombo) maxcombo = combo;
                        break;
                    case '2':
                        combo = 0;
                        errors++;
                        break;
                }
            }
        }
    }

    let wpm = Math.ceil(correctChars * (60 / gameTime) / 5);
    let coinsToAdd = Math.round(score/200);
    
    return {
        coinsToAdd: coinsToAdd,
        score: score,
        wpm: wpm,
        errors: errors,
        maxcombo: maxcombo,
        gameTime: gameTime
    }
}

function getLevelFromScore(totalScore){
    for(count = 0; count < scoreNeededForLevels.length; count++){
        if(scoreNeededForLevels[count] > totalScore) return count + 1;
    }
    return -1;
}

module.exports = {
    getScoreData
}
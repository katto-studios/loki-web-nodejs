//PERFORM OBFUSCATION OF IMPT CODE IN https://obfuscator.io/

//public code found in ./src/js

//#region game.js onKeyDown 
if(key == "Tab") reloadGame();
key = key.toLowerCase();
if((!this.VALIDCHARS.includes(key) && key != "backspace") || !this.canType) return;
if(!this.started){
    if(key === this.wordObjects[0][0].characters[0].char){
        this.started = true;
        this.charIndex = 1;
        this.renderWords();
    }
} 
else {
    let currentRow = this.wordObjects[this.rowIndex];
    let currentWord = currentRow[this.wordIndex];
    let currentChar = currentWord.characters[this.charIndex];
    
    currentChar.timeTaken = this.comboTimer;

    
    console.log(key);
    if(key === "backspace"){
        console.log("bp")
        if(this.charIndex > 0){
            this.charIndex--;
            this.renderWords();
        }
        return;
    }

    if(currentChar.char === " " && key != " "){
        return;
    }

    if(key === " " && currentChar.char != " " && this.charIndex != 0){
        this.charIndex = 0;
        if(this.wordIndex == currentRow.length - 1){
            this.wordIndex = 0;
            this.finishRow();
        } else {
            this.wordIndex++;
        }
        this.renderWords();
        return;
    }
    
    if(currentChar.state === charState.UNTYPED){
        if(key === currentChar.char){
            currentChar.state = charState.CORRECT;
            this.score += Math.floor(this.comboTimer * this.combo);
            this.comboTimer = 1.0;
            this.combo++;
            if(this.combo > this.maxcombo) this.maxcombo = this.combo;
            this.correctChars++;
        } else {
            currentChar.state = charState.WRONG;
            this.combo = 0;
        }

    } else if(currentChar.state === charState.WRONG){
        if(key === currentChar.char){
            currentChar.state = charState.UNTYPED;
        } else {
            currentChar.state = charState.WRONG;
            this.combo = 0;
        }
    }
    
    if(this.charIndex == currentWord.characters.length - 1){
        this.charIndex = 0;
        if(this.wordIndex == currentRow.length - 1){
            this.wordIndex = 0;
            this.finishRow();
        } else {
            this.wordIndex++;
        }
    } else {
        this.charIndex++;
    }

    this.renderWords();
}
//#endregion

//#region multiplayer-game.js onKeyDown
key = key.toLowerCase();
if((!this.VALIDCHARS.includes(key) && key != "backspace") || !this.canType) return;
if(!this.started){
    if(key === this.wordObjects[0][0].characters[0].char){
        this.started = true;
        this.charIndex = 1;
        this.renderWords();
    }
} 
else {
    let currentRow = this.wordObjects[this.rowIndex];
    let currentWord = currentRow[this.wordIndex];
    let currentChar = currentWord.characters[this.charIndex];
    
    currentChar.timeTaken = this.comboTimer;

    
    console.log(key);
    if(key === "backspace"){
        console.log("bp")
        if(this.charIndex > 0){
            this.charIndex--;
            this.renderWords();
        }
        return;
    }

    if(currentChar.char === " " && key != " "){
        return;
    }

    if(key === " " && currentChar.char != " " && this.charIndex != 0){
        this.charIndex = 0;
        if(this.wordIndex == currentRow.length - 1){
            this.wordIndex = 0;
            this.finishRow();
        } else {
            this.wordIndex++;
        }
        this.renderWords();
        return;
    }
    
    if(currentChar.state === charState.UNTYPED){
        if(key === currentChar.char){
            currentChar.state = charState.CORRECT;
            this.score += Math.floor(this.comboTimer * this.combo);
            this.comboTimer = 1.0;
            this.combo++;
            if(this.combo > this.maxcombo) this.maxcombo = this.combo;
            this.correctChars++;
        } else {
            currentChar.state = charState.WRONG;
            this.combo = 0;
        }

    } else if(currentChar.state === charState.WRONG){
        if(key === currentChar.char){
            currentChar.state = charState.UNTYPED;
        } else {
            currentChar.state = charState.WRONG;
            this.combo = 0;
        }
    }
    
    if(this.charIndex == currentWord.characters.length - 1){
        this.charIndex = 0;
        if(this.wordIndex == currentRow.length - 1){
            this.wordIndex = 0;
            this.finishRow();
        } else {
            this.wordIndex++;
        }
    } else {
        this.charIndex++;
    }

    this.renderWords();
}
//#endregion
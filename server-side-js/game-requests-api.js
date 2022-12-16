const { verify } = require('./google-login');
const { updateClient, getClientWithUserdata } = require('./mongo-db-helper');
const { getScoreData } = require('./game-utils');
const pool = require('./utils/pgsql-helper');

//Xp to level conversion
//(int)Math.Floor(40.0 * Math.Log(TotalScore / 1500L + 56.0, 10) - 70.0);
//Xp for next level
//(long)Math.Floor(Math.Pow(10, (++_currentLevel + 70.0f) / 40.0) - 56.0f) * 1500;
const scoreNeededForLevels = [
    10500, 15000, 21000, 27000, 34500, 42000, 49500, 57000, 66000, 73500, 84000, 93000, 103500, 115500, 127500, 139500, 153000, 166500, 181500, 198000, 214500, 232500, 250500, 271500, 292500, 315000, 337500, 363000, 390000, 417000, 447000, 478500, 513000, 547500, 585000, 625500, 667500, 711000, 759000, 808500, 861000, 918000, 976500, 1039500, 1107000, 1177500, 1252500, 1332000, 1416000, 1504500, 1599000, 1698000, 1803000, 1915500, 2034000, 2160000, 2292000, 2433000, 2583000, 2740500, 2908500, 3085500, 3273000, 3472500, 3682500, 3906000, 4143000, 4393500, 4659000, 4939500, 5238000, 5553000, 5887500, 6240000, 6615000, 7012500, 7432500, 7878000, 8350500, 8850000, 9379500, 9940500, 10534500, 11163000, 11830500, 12535500, 13284000, 14076000, 14916000, 15804000, 16746000, 17743500, 18799500, 19918500, 21103500, 22359000, 23688000, 25098000, 26589000, 28170000
];

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
		let word = ""
		this.characters.forEach((character)=>{
			word += character.char;
		})
		return word;
	}

	constructor(word){
		let rawCharacters = Array.from(word).forEach((rawChar)=>this.characters.push(new Character(rawChar)));
	}
}

async function handleEndGame(idToken, gameData){
    let mongoUserData = await getClientWithUserdata(await verify(idToken));
    let scoreData = getScoreData(gameData);
    let isCheating = await logGameData(scoreData, mongoUserData._id);
    if(isCheating){
        return { 
            coinsToAdd: 'cheating?'
        }
    } 
    let query = {
        $inc: { 
            total_games_played: 1,
            total_score: scoreData.score,
            total_wpm: scoreData.wpm,
            'coins.scrap': scoreData.coinsToAdd
        },
        $set: {
            level: getLevelFromScore(mongoUserData.total_score + scoreData.score)
        }
    };
    if(mongoUserData.highest_score < scoreData.score){
        query.$inc.highest_score = scoreData.score;
    }

    if(mongoUserData.highest_wpm < scoreData.wpm){
        query.$inc.highest_wpm = scoreData.wpm;
    }
    
    await updateClient(mongoUserData._id,  query);
    return {
        coinsToAdd: scoreData.coinsToAdd,
        serverScore: scoreData.score,
        serverWpm: scoreData.wpm,
        serverErrors: scoreData.errors,
        serverMaxcombo: scoreData.maxcombo
    }
}

const GAMETIME_TO_MILISECOND = 15 * 1000;
async function logGameData(gameData, userId){
    let gameResult = {
        ...gameData,
        userId: userId,
        timestamp: +new Date()
    };

    let cheatQuery = await pool.query('SELECT timestamp FROM gamedata WHERE userid = $1 ORDER BY timestamp DESC LIMIT 1', [userId]);
    //first game detection
    if(cheatQuery.rows.length > 0){    
        if(gameResult.timestamp - cheatQuery.rows[0].timestamp < GAMETIME_TO_MILISECOND){
            //games submitted too fast
            return true;
        }
    }

    await pool.query(`SELECT * FROM "LogGameData"($1, $2, $3::SMALLINT, $4::SMALLINT, $5::SMALLINT, $6::SMALLINT, $7::SMALLINT, $8::SMALLINT)`,
    [gameResult.userId, gameResult.timestamp, gameResult.score, gameResult.wpm, gameResult.errors, gameResult.maxcombo, gameResult.coinsToAdd, gameResult.gameTime]);

    return false;
}

function getLevelFromScore(totalScore){
    for(count = 0; count < scoreNeededForLevels.length; count++){
        if(scoreNeededForLevels[count] > totalScore) return count + 1;
    }
    return Math.floor(40 * Math.log10(totalScore / 1500 + 56) - 70);
}

module.exports = {
    handleEndGame
}
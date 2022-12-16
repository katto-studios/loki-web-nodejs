const pool = require('../utils/pgsql-helper');

async function getUserScoreInfo(userId){
    let queryResult = await pool.query(`SELECT * FROM "GetLastGames"($1, 20::SMALLINT)`, [userId]);
    if(queryResult.rows.length === 0){
        return {
            highestScore: 0,
            highestWpm: 0,
            avgScore: 0,
            avgWpm: 0
        };
    }
    return {
        highestScore: Math.max(...queryResult.rows.map(x => x.score)),
        highestWpm: Math.max(...queryResult.rows.map(x => x.wpm)),
        avgScore: Math.floor(queryResult.rows.map(x => x.score).reduce((a, b) => a + b, 0) / queryResult.rows.length),
        avgWpm: Math.floor(queryResult.rows.map(x => x.wpm).reduce((a, b) => a + b, 0) / queryResult.rows.length)
    };
}

module.exports = {
    getUserScoreInfo
}
//TODO: TIDY THINGS UP
const pool = require('../utils/pgsql-helper');
const Filter = require('bad-words');
const { queryCollectionOne } = require('../mongo-db-helper');

const filter = new Filter();
const milisecondsInAnHour = 3600000;
const milisecondsInADay = 86400000;
const milisecondsInAWeek = 604800000;
const milisecondsToFlooredMonday = 259200000;   //unix time starts on a thursday; this is 3 days in miliseconds
const leaderboardCache = {
    scoreWeekly: [],
    scoreAlltime: [],
    wpmWeekly: [],
    wpmAlltime: [],
};
var latestRefresh = 0;

function getAllLeaderboard(limit) {
    let returnMe = JSON.parse(JSON.stringify(leaderboardCache));
    for(const key in returnMe) {
        returnMe[key] = returnMe[key].slice(0, limit);
    }
    returnMe.timeTillRefresh = getTimeTillNextHour();
    returnMe.timeTillWeekly = 0;
    return returnMe;
}

async function refreshLeaderboards() {
    const getScoreAllTime = async () => {
        let results = (await pool.query('SELECT * FROM "GetScoreLeaderboards"($1::SMALLINT)', [20])).rows;
        //let userDatas = (await Promise.all(results.map(x => getUserInfoLite(x.userid))));
        let usernames = await Promise.all(results.map(x => getUsernameFromId(x.userid)));

        leaderboardCache.scoreAlltime = results.map((x, count) => {
            return {
                score: x.score,
                username: tryClean(usernames[count].username)
            };
        });
    };

    const getWpmAllTime = async () => {
        let results = (await pool.query('SELECT * FROM "GetWpmLeaderboards"($1::SMALLINT)', [20])).rows;
        //let userDatas = (await Promise.all(results.map(x => getUserInfoLite(x.userid))));
        let usernames = await Promise.all(results.map(x => getUsernameFromId(x.userid)));

        leaderboardCache.wpmAlltime = results.map((x, count) => {
            return {
                wpm: x.wpm,
                username: tryClean(usernames[count].username)
            };
        });
    };

    const getScoreWeekly = async (startTimestamp, endTimestamp) => {
        let results = (await pool.query('SELECT * FROM "GetScoreLeaderboards"($1::SMALLINT, $2, $3)', [20, startTimestamp, endTimestamp])).rows;
        //let userDatas = (await Promise.all(results.map(x => getUserInfoLite(x.userid))));
        let usernames = await Promise.all(results.map(x => getUsernameFromId(x.userid)));

        leaderboardCache.scoreWeekly = results.map((x, count) => {
            return {
                score: x.score,
                username: tryClean(usernames[count].username)
            };
        });
    };

    const getWpmWeekly = async (startTimestamp, endTimestamp) => {
        let results = (await pool.query('SELECT * FROM "GetWpmLeaderboards"($1::SMALLINT, $2, $3)', [20, startTimestamp, endTimestamp])).rows;
        //let userDatas = (await Promise.all(results.map(x => getUserInfoLite(x.userid))));
        let usernames = await Promise.all(results.map(x => getUsernameFromId(x.userid)));

        leaderboardCache.wpmWeekly = results.map((x, count) => {
            return {
                wpm: x.wpm,
                username: tryClean(usernames[count].username)
            };
        });
    };

    latestRefresh = +new Date();
    const { startTimestamp, endTimestamp } = getUnixWeekBounds(latestRefresh);
    await Promise.all([
        getScoreAllTime(),
        getWpmAllTime(),
        getScoreWeekly(startTimestamp, endTimestamp),
        getWpmWeekly(startTimestamp, endTimestamp)
    ]);
}

function tryClean(word) {
    let returnMe = word;
    try {
        returnMe = filter.clean(word);
    } catch {}
    return returnMe;
}

async function getUsernameFromId(userid) {
    return await queryCollectionOne('users', { _id: userid }, { username: 1 });
}

function getUnixWeekBounds(originTimestamp) {
    const day = (Math.floor(originTimestamp / milisecondsInADay) - 4) % 7;
    //Get unix time of Monday 00:00 & Sunday 23:59 of the week originTimestamp is in
    let weeksSinceStartUnix = Math.floor(originTimestamp / milisecondsInAWeek) + (day < 3);
    let startTimestamp = weeksSinceStartUnix * milisecondsInAWeek - milisecondsToFlooredMonday;
    let endTimestamp = startTimestamp + milisecondsInAWeek;
    return { startTimestamp, endTimestamp };
}

async function initalizeAutomaticRefresh() {
    latestRefresh = +new Date();
    //find nearest hour
    const nextHourUnixTime = Math.ceil(latestRefresh / milisecondsInAnHour) * milisecondsInAnHour;
    let timeTillNextHour = nextHourUnixTime - latestRefresh;
    await refreshLeaderboards();  //original refresh
    setTimeout(async () => {
        await refreshLeaderboards();  //refresh at next hour
        setInterval(refreshLeaderboards, milisecondsInAnHour);  //refresh every hour afterwards
    }, timeTillNextHour);
}

function getTimeTillNextHour() {
    //Gets the next hour's unix timestamp
    const currentTime = +new Date();
    const nextHourUnixTime = Math.ceil(currentTime / milisecondsInAnHour) * milisecondsInAnHour;
    return nextHourUnixTime - currentTime;
}

module.exports = {
    getAllLeaderboard,
    refreshLeaderboards,
    initalizeAutomaticRefresh
};
window.addEventListener('load', refreshLeaderboards, true);
var refreshTimerDisplayTimeout = false;
var displayTimer = false;
var prevTime = 0;
var leaderboardCache = false;
var showingWeekly = true;

async function refreshLeaderboards(){
    displayTimer = $('#refresh-timer-display');
    leaderboardCache = await $.get('/user-api/get-leaderboard-cache');
    displayWeeklyLeaderboards();
}

function toggleDisplayLeaderboards(){
    showingWeekly ^= 1;
    if(showingWeekly){
        displayWeeklyLeaderboards();
    }else{
        displayAllTimeLeaderboards();
    }
}

function displayAllTimeLeaderboards(){
    const { scoreAlltime, wpmAlltime, timeTillRefresh } = leaderboardCache;

    refreshScoreLeaderboards(scoreAlltime);
    refreshWpmLeaderboards(wpmAlltime);
    refreshTimerDisplay(timeTillRefresh);

    $('#leaderboard-type-display').html('<i class="fas fa-calendar-week"></i> All time');
}

function displayWeeklyLeaderboards(){
    const { scoreWeekly, wpmWeekly, timeTillRefresh } = leaderboardCache;

    refreshScoreLeaderboards(scoreWeekly);
    refreshWpmLeaderboards(wpmWeekly);
    refreshTimerDisplay(timeTillRefresh);

    $('#leaderboard-type-display').html('<i class="fas fa-calendar-week"></i> Weekly');
}

function refreshScoreLeaderboards(scores){
    const scoreLeaderBoard = $('#score-leaderboard-content');
    scoreLeaderBoard.empty();
    scores.forEach((x, index) =>{
        scoreLeaderBoard.append(`
            <div class="leaderboard-item">
                <h1>${index + 1}. </h1><h1>${x.username}</h1>
                <p>${x.score}</p>
            </div>
        `);
    });
}

function refreshWpmLeaderboards(wpms){
    const wpmLeaderBoard = $('#wpm-leaderboard-content');
    wpmLeaderBoard.empty();
    wpms.forEach((x, index) =>{
        wpmLeaderBoard.append(`
            <div class="leaderboard-item">
                <h1>${index + 1}. </h1><h1>${x.username}</h1>
                <p>${x.wpm}</p>
            </div>
        `);
    });
}

function refreshTimerDisplay(timeTillRefresh){
    if(refreshTimerDisplayTimeout) clearTimeout(refreshTimerDisplayTimeout);
    prevTime = Math.floor(timeTillRefresh / 1000);
    refreshTimerDisplayTimeout = setInterval(() => {
        let date = new Date(0);
        date.setSeconds(prevTime);
        displayTimer.html(`Refreshes in: ${date.toISOString().substr(11, 8)}`);
        prevTime -= 1;
    }, 1000);
}
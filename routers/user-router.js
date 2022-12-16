const userModule = require('../server-side-js/user-api');
const { getRoomWords, scrubLines } = require('../gameplay-modules/mass-multiplayer');
const wordsList = require('../gameplay-modules/words-list');
const gamerModules = require('../server-side-js/game-requests-api');
const { redeemCode } = require('../server-side-js/apis/code-redeem-api');
const scoreApi = require('../server-side-js/apis/score-api');
const leaderboardApi = require('../server-side-js/apis/leaderboard-api');

const gachaRouter = require('./gacha-router');
const inventoryRouter = require('./inventory-router');

var router = require('express').Router();
router.use('/gacha', gachaRouter);
router.use('/inventory', inventoryRouter);

//Post API
router.post('/login', handleLoginPOST);
router.post('/change-user-name', handleChangeNamePOST);
router.post('/change-user-description', handleChangeDescriptionPOST);
router.post('/end-game', handleEndGamePOST);

router.post('/search-user', handleSearchUserPOST);
router.post('/send-friend-request', handleSendFriendRequestPOST);
router.post('/accept-friend-request', handleAcceptFriendRequestPOST);
router.post('/reject-friend-request', handleRejectFriendRequestPOST);
router.post('/get-friend-data', handleUserFriendsPOST);
router.post('/friend-status', handleUserFriendStatusPOST);
router.post('/get-online-friends', handleUserGetOnlineFriendsPOST);

router.post('/redeem-code', handleRedeemCodePOST);

//Get API
router.get('/user-keyboard', handleEquipedKeyboardGET);
router.get('/user-theme', handleEquipedThemeGET);
router.get('/random-words', handleGetRandomWordsGET);
router.get('/get-score-data', handleGetScoreDataGET);
router.get('/get-leaderboard-cache', handleGetLeaderboardCacheGET);

//API Handlers
function handleGetLeaderboardCacheGET(req, res){
    let limit = req.query.limit;
    if(!limit) limit = 20;
    res.send(leaderboardApi.getAllLeaderboard(limit));
}

async function handleGetScoreDataGET(req, res){
    res.send(await scoreApi.getUserScoreInfo(req.query.userid));
}

async function handleRedeemCodePOST(req, res){
    let tokenId = req.body.idToken;
    let code = req.body.code;
    res.send(await redeemCode(tokenId, code));
}

function handleUserGetOnlineFriendsPOST(req, res){
    let tokenId = req.body.idToken;
    userModule.getOnlineFriends(tokenId)
        .then(result => {
            res.send(result);
        })
        .catch(console.log);
}

function handleUserFriendStatusPOST(req, res){
    let requesterTokenId = req.body.idToken;
    let targetId = req.body.otherUser;

    userModule.getFriendStatus(requesterTokenId, targetId)
        .then(result => res.send(result))
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
}

function handleSearchUserPOST(req, res){
    userModule.searchUsers(req.body.searchTerm)
        .then(users => {
            res.send(users);
        })
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
}

function handleUserFriendsPOST(req, res){
    let requester = req.body.idToken;
    userModule.getFriendData(requester)
        .then(result =>{
            res.send({
                friends: result[0],
                pending: result[1]
            });
        })
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
}

function handleSendFriendRequestPOST(req, res){
    let sender = req.body.idToken;
    let recevier = req.body.target;
    userModule.sendFriendRequest(sender, recevier)
        .then(result => res.send(result))
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
}

function handleAcceptFriendRequestPOST(req, res){
    let idToken = req.body.idToken;
    let targetId = req.body.target;
    userModule.acceptFriendRequest(idToken, targetId)
        .then(result => {
            res.sendStatus(200);
        })
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
}

function handleRejectFriendRequestPOST(req, res){
    let idToken = req.body.idToken;
    let targetId = req.body.target;
    userModule.rejectFriendRequest(idToken, targetId)
        .then(result => {
            res.sendStatus(200);
        })
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
}

function handleLoginPOST(req, res) {
    userModule.loginAsUser(req.body.idToken)
        .then(data => {
            res.send(data);
        })
        .catch(err => console.log(err));
}

function handleChangeNamePOST(req, res){
    userModule.changeName(req.body.tokenId, req.body.newName)
        .then(result => res.sendStatus(200))
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
}

function handleChangeDescriptionPOST(req, res){
    userModule.changeDescription(req.body.tokenId, req.body.newDescription)
        .then(result => res.sendStatus(200))
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
}

function handleEndGamePOST(req, res) {
    let actualData = JSON.parse(req.body.dataStr);
    gamerModules.handleEndGame(actualData.idToken, actualData.gameData)
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
}

function handleEquipedKeyboardGET(req, res){
    let targetId = req.query.id;
    userModule.getUserInfoLite(targetId)
        .then(userDataLite =>{
            return Promise.all([
                getKeyboardFromId(userDataLite.equiped.keyset),
                getCaseFromId(userDataLite.equiped.case)
            ]);
        })
        .then(resArr => {
            res.send({
                keyset: resArr[0],
                case: resArr[1]
            });
        })
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
}

function handleEquipedThemeGET(req, res){
    let targetId = req.query.id;
    userModule.getUserInfoLite(targetId)
        .then(userDataLite =>{
            return getThemeFromId(userDataLite.equiped.theme);
        })
        .then(theme => {
            console.log(theme)
            res.send(theme);
        })
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
}

function handleGetRandomWordsGET(req, res){
    try{
        if(req.query.count){
            let promiseArr = [];
            for(let count = 0; count < req.query.count; count++){
                promiseArr.push(getRoomWords(Math.random().toString()));
            }
            Promise.all(promiseArr)
                .then(resArr =>{
                    return scrubLines(resArr);
                })
                .then(final => {
                    res.send(final);
                })
        }else{
            getRoomWords(Math.random().toString())
                .then(words => {
                    res.send(words);
                })
                .catch(err => console.log(err));
        }
    }catch(ex){
        res.send({message: ex, code: 401});
    }
}

module.exports = router;
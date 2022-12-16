const userModule = require('./server-side-js/user-api');
const wordsList = require('./gameplay-modules/words-list');
const { initalizeSocketIo } = require('./server-side-js/js/socket-io-manager.js');
const { MultiplayerManager } = require('./server-side-js/js/multiplayer-manager');
const scoreApi = require('./server-side-js/apis/score-api');

const stripeApi = require('./routers/stripe-router');
const userApi = require('./routers/user-router');
const { initalizeAutomaticRefresh } = require('./server-side-js/apis/leaderboard-api');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = new express();
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(require('cookie-parser')());
app.use(express.static('./src'));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(function(req, res, next){ 
    if (req.originalUrl === '/payments/stripe-webhook') {
        bodyParser.raw({ type: 'application/json' })(req, res, next)
    }else{
        express.json({ limit: '50mb' })(req, res, next);
    }
});

//Rotuing
app.use('/user-api', userApi);
app.use('/payments', stripeApi);

app.set('views', './src');
app.set('view engine', 'ejs');


const server = app.listen(port, () =>{
	console.log(`Server started on port: ${port}`);
	wordsList.init();
});

//GameManager.initalizeManager(server);
// initalizeSocketIo(server);
MultiplayerManager.initalize(server);
initalizeAutomaticRefresh();

//Pages
app.get('/', handleGetIndexPage);
app.get('/users', handleGetUserPage);
app.get('/user-small', handleGetUserPageSmall);
app.get('/health-check', (req, res) =>{
    res.sendStatus(200);
})

//Pages
async function handleGetUserPageSmall(req, res) {
    let [liteData, scoreData] = await Promise.all([
        userModule.getUserInfoLite(req.query.id),
        scoreApi.getUserScoreInfo(req.query.id)
    ]);
    res.render('other-profile-small', getProfileData(liteData, scoreData));
}

async function handleGetUserPage(req, res) {
    let [liteData, scoreData] = await Promise.all([
        userModule.getUserInfoLite(req.query.id),
        scoreApi.getUserScoreInfo(req.query.id)
    ])
    res.render('profile', getProfileData(liteData, scoreData));
}

function getProfileData(liteData, scoreData){
    return {
        userData: liteData,
        scoreData: scoreData,
        version: process.env.VERSION
   }
}

function handleGetIndexPage(req, res){
    res.render('index', {
        version: process.env.VERSION
    });
}
const gachaApi = require('../server-side-js/gacha-api');

const router = require('express').Router();

router.get('/avaliable-rolls', (req, res) =>{
    res.send(gachaApi.getAvaliableRolls());
});

router.post('/regular', async(req, res)=> {
    let idToken = req.body.idToken;
    res.send(await gachaApi.regularGacha(idToken));
});

router.post('/premium', async(req, res) =>{
    let idToken = req.body.idToken;
    res.send(await gachaApi.premiumGacha(idToken));
});

router.post('/season_2', async(req, res) =>{
    let idToken = req.body.idToken;
    res.send(await gachaApi.season2Gacha(idToken));
});

module.exports = router;
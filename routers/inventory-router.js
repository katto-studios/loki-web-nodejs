const userModule = require('../server-side-js/user-api');
const { getClientWithUserid } = require('../server-side-js/mongo-db-helper');
const { getItemFromId } = require('../server-side-js/inventory-api');

var router = require('express').Router();

router.get('/equippedFull',(req, res)=>{
    getClientWithUserid(req.query.id)
        .then(result =>{
            if(result){
                return Promise.all([
                    getItemFromId(result.equiped.keyset),
                    getItemFromId(result.equiped.theme),
                    getItemFromId(result.equiped.case)
                ]);
            }else{
                return false;
            }
        })
        .then(resultArr => {
            if(resultArr){
                res.send({
                    keyset: resultArr[0],
                    theme: resultArr[1],
                    case: resultArr[2]
                });
            }
        })
        .catch(err => console.log(err));
});

router.get('/keyset', (req, res) =>{
    getKeyboardFromId(req.query.id)
        .then(result => res.send(result))
        .catch(err => console.log(err));
});

router.get('/theme', (req, res) =>{
    getThemeFromId(req.query.id)
        .then(result => res.send(result))
        .catch(err => console.log(err));
});

router.post('/get-inventory', (req, res) =>{
    let tokenId = req.body.idToken;
    return userModule.getUserInventory(tokenId)
        .then(result => res.send(result))
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
});

router.post('/equip-keyset', (req, res) =>{
    let tokenId = req.body.idToken;
    let itemId = req.body.itemId;

    userModule.equipKeyset(tokenId, itemId)
        .then(resultData => res.sendStatus(200))
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
});

router.post('/equip-theme', (req, res) =>{
    let tokenId = req.body.idToken;
    let itemId = req.body.itemId;

    userModule.equipTheme(tokenId, itemId)
        .then(resultData => res.sendStatus(200))
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
})

router.post('/equip-case', (req, res)=>{
    let tokenId = req.body.idToken;
    let itemId = req.body.itemId;

    userModule.equipCase(tokenId, itemId)
        .then(resultData => res.sendStatus(200))
        .catch(err => {
            res.sendStatus(500);
            console.log(err);
        });
});

router.post('/scrap-item', (req, res) =>{
    let tokenId = req.body.idToken;
    let itemId = req.body.itemId;

    userModule.scrapItem(tokenId, itemId)
        .then(result => res.send(result))
        .catch(err => console.log(err));
});

router.post('/set-favourite', (req, res) =>{
    let tokenId = req.body.idToken;
    let itemId = req.body.itemId;

    userModule.toggleItemFav(tokenId, itemId)
        .then(result => res.send(result))
        .catch(err => console.log(err));
});

module.exports = router;
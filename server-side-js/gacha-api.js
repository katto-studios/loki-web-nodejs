//const { getRandomColor } = require('./aws-helper');
const randomColor = require('randomcolor');
const { verify } = require('./google-login');
const { updateClient, getClientWithUserdata, getRandomColor, insertCollectionOne, aggregateCollection } = require('./mongo-db-helper');
const { ObjectID, ObjectId } = require('mongodb');
const { getRandomMods } = require('./mods-api');
const GACHA_COST = 100;
const REFUND_GOLD = 10, REFUND_SCRAP = 80, REFUND_GOLD_PREMIUM = 80;
const PREMIUM_ODDS = {
    Rare: 0.6,
    Epic: 0.3,
    Legendary: 0.1
}
const REGULAR_ODDS = {
    Common: 0.7,
    Rare: 0.18,
    Epic: 0.09,
    Legendary: 0.03
}

function getAvaliableRolls(){
    return [
        {
            gachaName: 'keyset',
            endpoint: '/user-api/gacha/regular',
            banner: '../res/random_keycap_banner.jpg',
            cost: 100,
            type: 'scrap'
        },
        {
            gachaName: 'keyset premium',
            endpoint: '/user-api/gacha/premium',
            banner: '../res/random_keycap_banner_2.jpg',
            cost: 100,
            type: 'gold',
        },
        {
            gachaName: 'loki season 2',
            endpoint: '/user-api/gacha/season_2',
            banner: '../res/banner_loki_collection_2.png',
            cost: 250,
            type: 'gold',
        }
    ];
}

function createNewKeyset(){
    //keycap-c1
    //keycap-c2
    return getRandomColor(2)
        .then(results =>{
            let c1 = results[0];
			let c2 = results[1];
			let splitc1 = c1.bestName.split(' ');
			let splitc2 = c2.bestName.split(' ');
            return {
                '_id': new ObjectID(),
                'name': `${splitc1[Math.floor(Math.random() * splitc1.length)]} ${splitc2[Math.floor(Math.random() * splitc2.length)]}`,
                'keycap-c1': `#${c1._id}`,
                'keycap-c2': `#${c2._id}`,
                'mods': getRandomMods(1),
                'description': 'From the random keycaps #1 set',
                'type': 'keyset',
                'rarity': 'Common',
                'collection': 'Random Keycaps Collection'
            }
        }).then(keyset =>{
            insertCollectionOne('items', keyset)
            return keyset;
        });
}

function getPremiumRandomRarity(){
    return getRandomRarityFromOdds(PREMIUM_ODDS);
}

function getRegularRandomRarity(){
    return getRandomRarityFromOdds(REGULAR_ODDS);
}

function getRandomRarityFromOdds(odds){
    let randomNumber = Math.random();
    //Whack math but works
    for(let key in odds){
        let value = odds[key];
        randomNumber -= value;
        if(randomNumber < 0) return key;    //oob alr
    }

    return 'Legendary';
}

function getRandomPremiumItem(rarity){
    return aggregateCollection('items', [
        { 
            $match: {
                rarity: rarity
            }
        },
        {
            $sample: {
                size: 1
            }
        }
    ])
    .then(resArr => resArr[0]);
}

function getRandomPremiumItemFromCollection(rarity, collection){
    return aggregateCollection('items', [
        { 
            $match: { rarity, collection }
        },
        {
            $sample: {
                size: 1
            }
        }
    ])
    .then(resArr => resArr[0]);
}

async function regularGacha(idToken){
    let fullUserData = await verify(idToken);
    let client = await getClientWithUserdata(fullUserData);
    
    if(client.coins.scrap < GACHA_COST) return false;
    let rarity = getRegularRandomRarity();
    if(rarity === 'Common'){
        //Common item, new keyset
        let item = await createNewKeyset();
        await updateClient(client._id, {
            $push:{
                'inventory.keysets': new ObjectId(item._id)
            },
            $inc:{
                'coins.scrap': -GACHA_COST
            }
        });
        return {
            item: item,
            coinChange: {
                scrap: -GACHA_COST,
                gold: 0
            },
            isDupe: false
        };
    }else{
        let item = await getRandomPremiumItem(rarity);
        if(client.inventory[`${item.type}s`].map(x => `${x}`).includes(`${item._id}`)){
            //Not common, duplicate
            await updateClient(client._id, {
                $inc:{
                    'coins.scrap': -(GACHA_COST - REFUND_SCRAP),
                    'coins.gold': REFUND_GOLD
                }
            });
            return {
                item: item,
                coinChange: {
                    scrap: -GACHA_COST + REFUND_SCRAP,
                    gold: REFUND_GOLD
                },
                refund: {
                    scrap: REFUND_SCRAP,
                    gold: REFUND_GOLD
                },
                isDupe: true
            };
        }else{
            //Not common, not duplicate
            let query = {
                $push:{},
                $inc:{
                    'coins.scrap': -GACHA_COST
                }
            }
            query['$push'][`inventory.${item.type}s`] = new ObjectId(item._id);
            await updateClient(client._id, query);
            return {
                item: item,
                coinChange: {
                    scrap: -GACHA_COST,
                    gold: 0
                },
                isDupe: false
            };
        }
    }
}

async function premiumGacha(idToken){
    let fullUserData = await verify(idToken);
    let client = await getClientWithUserdata(fullUserData);
    
    if(client.coins.gold < GACHA_COST) return false;
    let rarity = getPremiumRandomRarity();
    let item = await getRandomPremiumItem(rarity);
    if(client.inventory[`${item.type}s`].map(x => `${x}`).includes(`${item._id}`)){
        //Duplicate
        await updateClient(client._id, {
            $inc:{
                'coins.gold': -GACHA_COST + REFUND_GOLD_PREMIUM
            }
        });
        return {
            item: item,
            coinChange: {
                scrap: 0,
                gold: -GACHA_COST + REFUND_GOLD_PREMIUM
            },
            refund: {
                gold: REFUND_GOLD_PREMIUM
            },
            isDupe: true
        };
    }else{
        //Not dupe
        let query = {
            $inc:{
                'coins.gold': -GACHA_COST
            },
            $push:{}
        };
        query['$push'][`inventory.${item.type}s`] = new ObjectId(item._id);
        await updateClient(client._id, query);
        return {
            item: item,
            coinChange: {
                scrap: 0,
                gold: -GACHA_COST
            },
            isDupe: false
        };
    }
}

async function season2Gacha(idToken){
    let fullUserData = await verify(idToken);
    let client = await getClientWithUserdata(fullUserData);
    const season2GachaCost = 250;
    const season2DupeReturn = 150;
    
    if(client.coins.gold < season2GachaCost) return false;
    let rarity = getRandomRarityFromOdds({
        Epic: 0.7,
        Legendary: 0.3
    });
    let item = await getRandomPremiumItemFromCollection(rarity, 'Loki collection #2');
    if(client.inventory[`${item.type}s`].map(x => `${x}`).includes(`${item._id}`)){
        //Duplicate
        await updateClient(client._id, {
            $inc:{
                'coins.gold': -season2GachaCost + season2DupeReturn
            }
        });
        return {
            item: item,
            coinChange: {
                scrap: 0,
                gold: -season2GachaCost + season2DupeReturn
            },
            refund: {
                gold: season2DupeReturn
            },
            isDupe: true
        };
    }else{
        //Not dupe
        let query = {
            $inc:{
                'coins.gold': -season2GachaCost
            },
            $push:{}
        };
        query['$push'][`inventory.${item.type}s`] = new ObjectId(item._id);
        await updateClient(client._id, query);
        return {
            item: item,
            coinChange: {
                scrap: 0,
                gold: -season2GachaCost
            },
            isDupe: false
        };
    }
}

module.exports = {
    getAvaliableRolls, 
    regularGacha, premiumGacha, season2Gacha
}
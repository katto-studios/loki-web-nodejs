const { queryCollectionOne, insertCollectionOne } = require('./server-side-js/mongo-db-helper');
const VALID_CHARS = 'ABCDEFGHJKMNOPQRSTUVWZ'

async function getValidCode(len){
    let randomCode = '';
    for(let count = 0; count < len; count++){
        let randomIndex = Math.floor(Math.random() * VALID_CHARS.length);
        randomCode += VALID_CHARS.charAt(randomIndex);
    }
    if(await queryCollectionOne('redeemCodes', {_id: randomCode})){
        return getValidCode(len);
    }
    return randomCode;
}

// let finalArr = [...Array(5).keys()]
// console.log(finalArr)
let insertCodesPromise = [1000, 600, 500, 300, 300, 300, 300, 300, 300, 300].map(async(x) => {
    let insertMe = {
        _id: await getValidCode(10),
        redeemsLeft: 1,
        metadata:{
            type: 'incGold',
            amt: x
        }
    };

    return await insertCollectionOne('redeemCodes', insertMe);
});
(async() =>{
    let result = await Promise.all(insertCodesPromise);
})();
const { getClientWithUserdata, queryCollectionOne, updateCollectionOne, updateClient } = require('../mongo-db-helper')
const { verify } = require('../google-login');

async function redeemCode(tokenId, code){
    //get user data
    let userData = await getClientWithUserdata(await verify(tokenId));
    //check if redeem before
    if(userData.redeemedCodes.includes(code)) return {
        success: false,
        message: 'Already redeemed!'
    }

    //check if code exists
    let redeemObject = await queryCollectionOne('redeemCodes', {_id: code});
    if(!redeemObject) return {
        success: false,
        message: 'Code doesn\'t exist!'
    }
    if (redeemObject.redeemsLeft === 0) return {
        success: false,
        message: 'Code has already been redeemed!'
    }

    //add stuff to user and invalidate code
    if(!(await handleRedeemCode(userData._id, redeemObject))) return {
        success: false,
        message: 'Something went wrong!'
    }
    
    let resultStr = redeemObjectToString(redeemObject);
    return {
        success: true,
        message: resultStr
    }
}

async function handleRedeemCode(userId, redeemObject){
    let updateFunction = getUpdateFunction(redeemObject.metadata);
    if(!updateFunction) return false;

    if(redeemObject.redeemsLeft !== -1){
        await updateCollectionOne('redeemCodes', {
            _id: redeemObject._id
        }, {
            $inc: {
                redeemsLeft: -1
            }
        });
    }
    return await updateClient(userId, {
        ...updateFunction,
        $push:{
            'redeemedCodes': redeemObject._id
        }
    })
}

function getUpdateFunction(metadata){
    switch(metadata.type){
        case 'incGold':
            return {
                $inc: {
                    'coins.gold': parseInt(metadata.amt)
                }
            }
    }
    return false;
}

function redeemObjectToString(redeemObject){
    switch(redeemObject.metadata.type){
        case 'incGold':
            return `Redeemed <b>${redeemObject._id}</b> for <b>${redeemObject.metadata.amt} cash</b>!`;
    }
}

module.exports = {
    redeemCode
}
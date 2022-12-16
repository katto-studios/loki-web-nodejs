const DOMPurify = require('./DOMPurify');
const { ObjectID } = require('mongodb');
const { verify } = require('./google-login');
const { 
    getClientWithUserdata, updateClient, getClientWithUserid,
    getClientWithDescriptor, determineFriendStatus,
    queryCollectionMany, removeFromCollection
} = require('./mongo-db-helper');
const { getStatusString } = require('./utils/utils');
const { MultiplayerManager } = require('./js/multiplayer-manager');

function loginAsUser(token){
    return verify(token)
        .then(userId =>{
            return getClientWithUserdata(userId);
        })
        .catch(err => console.log(err));
}

function changeName(token, newName){
    return verify(token)
        .then(userData =>{
            let userId = userData['sub'];
            return updateClient(userId, {$set: {username: prufiy(newName)}});
        })
        .catch(err => console.log(err));
}

function changeDescription(token, newDescription){
    return verify(token)
        .then(userData =>{
            let userId = userData['sub'];
            return updateClient(userId, {$set: {description: prufiy(newDescription)}});
        })
        .catch(err => console.log(err));
}

function prufiy(targetString){
    return DOMPurify.sanitize(targetString);
}

//returns non-sensitive data of the target user
function getUserInfoLite(id){
    return getClientWithUserid(id)
        .then(fullUserData => {
            if(!fullUserData) return false;
            return convertUserInfoToLite(fullUserData);
        })
        .catch(err => console.log(err));
}

function getClientWithToken(tokenId){
    return verify(tokenId)
        .then(userData => {
            return getClientWithUserdata(userData);
        })
        .catch(console.log);
}

function searchUsers(descriptor){
    return getClientWithDescriptor(descriptor)
        .then(users =>{
            if(!users)return false;
            return users.map(x => convertUserInfoToLite(x));
        });
}

function convertUserInfoToLite(fullUserData){
    fullUserData.img_url = fullUserData.google_account_info.img_url;
    delete fullUserData.google_account_info;
    delete fullUserData.coins;
    delete fullUserData.pending_friends;
    delete fullUserData.friends;
    delete fullUserData.redeemedCodes;
    delete fullUserData.inventory;
    delete fullUserData.favourites;
    //delete fullUserData._id;
    let statusString = getStatusString(fullUserData.status);
    fullUserData.status = statusString;
    return fullUserData;
}

//#region Friend stuff

function getFriendStatus(tokenId, targetId){
    return verify(tokenId)
        .then(payload =>{
            return getClientWithUserdata(payload);
        })
        .then(userData =>{
            return userData._id;
        })
        .then(requesterId =>{
            return determineFriendStatus(requesterId, targetId);
        });
}

function getFriendData(tokenId){
    return verify(tokenId)
        .then(payload =>{
            return getClientWithUserdata(payload);
        })
        .then(userData =>{
            return Promise.all(
                [
                    getFriends(userData.friends),
                    getPendingFriends(userData.pending_friends)
                ]
            );
        })
}

function getPendingFriends(pendingIds){
    let pendingPromises = pendingIds.map(id => getUserInfoLite(id));
    return Promise.all(pendingPromises);
}

function getFriends(friendIds){
    let friendPromises = friendIds.map(id => getUserInfoLite(id));
    return Promise.all(friendPromises);
}

function sendFriendRequest(tokenId, target){
    return verify(tokenId)
        .then(payload =>{
            return getClientWithUserdata(payload);
        })
        .then(userData =>{
            return updateClient(target, {$push: {pending_friends: userData._id}});
        })
        .catch(err => console.log(err));
}

function acceptFriendRequest(tokenId, requester){
    return verify(tokenId)
        .then(payload =>{
            return getClientWithUserdata(payload);
        })
        .then(userData =>{
            return Promise.all([
                updateClient(userData._id, {$pull: {pending_friends: requester}}),
                updateClient(userData._id, {$push: {friends: requester}}),
                updateClient(requester, {$push: {friends: userData._id}})                
            ])
        })
        .catch(err => console.log(err));
}

function rejectFriendRequest(tokenId, requester){
    return verify(tokenId)
        .then(payload =>{
            return getClientWithUserdata(payload);
        })
        .then(userData =>{
            return updateClient(userData._id, {$pull: {pending_friends: requester}});
        })
        .catch(err => console.log(err));
}

async function getOnlineFriends(tokenId){
    const user = await getClientWithToken(tokenId);
    const onlineFriendIds = MultiplayerManager.getUsersOnline(user.friends);
    const result = await queryCollectionMany('users', {
        _id: {
            $in: onlineFriendIds
        }
    });
    return result.map(x => {
        return {
            uid: x._id,
            username: x.username,
            profileImg: x.google_account_info.img_url
        }
    })
}

//#endregion

//#region Inventory

function getUserInventory(tokenId){
    return verify(tokenId)
        .then(payload =>{
            return getClientWithUserdata(payload);
        })
        .then(userData =>{
            return [
                userData.inventory,
                userData.favourites
            ];
        })
        .then(arr =>{
            let inven = arr[0];
            let final = [...inven.keysets.map(x => {
                return {'_id': new ObjectID(x)};
            }), ...inven.themes.map(x => {
                return {'_id': new ObjectID(x)};
            }), ...inven.cases.map(x => {
                return {'_id': new ObjectID(x)};
            })];
            return [
                {
                    $or: final
                },
                arr[1]
            ];
        })
        .then(queries =>{
            return Promise.all([
                queryCollectionMany('items', queries[0]),
                queries[1],
            ]);
        })
        .then(resArr =>{
            return {
                inventory: resArr[0],
                favourites: resArr[1]
            }
        })
        .catch(err => console.log(err));
}

function equipKeyset(tokenId, itemId){
    return verify(tokenId)
        .then(payload =>{
            return getClientWithUserdata(payload);
        })
        .then(userData => {
            let userId = userData._id;
            return updateClient(userId, {
                $set:{
                    'equiped.keyset': new ObjectID(itemId)                        
                }
            });            
        });
}

function equipTheme(tokenId, itemId){
    return verify(tokenId)
        .then(payload =>{
            return getClientWithUserdata(payload);
        })
        .then(userData => {
            let userId = userData._id;
            return updateClient(userId, {
                $set:{
                    'equiped.theme': new ObjectID(itemId)                        
                }
            }); 
        });
}

function equipCase(tokenId, itemId){
    return verify(tokenId)
        .then(payload =>{
            return getClientWithUserdata(payload);
        })
        .then(userData => {
            let userId = userData._id;
            return updateClient(userId, {
                $set:{
                    'equiped.case': new ObjectID(itemId)                        
                }
            }); 
        });
}

function toggleItemFav(tokenId, itemId){
    let returnResult = {
        result: 'error',
        itemId: itemId
    }
    let uid = false;
    return verify(tokenId)
        .then(payload =>{
            return getClientWithUserdata(payload);
        })
        .then(userData =>{
            uid = userData._id;
            if(userData.favourites.includes(itemId)){
                //remove it
                returnResult.result = 'unfaved';
                return {
                    $pull: {
                        'favourites': itemId
                    }
                }
            }else{
                //add it
                returnResult.result = 'faved'
                return {
                    $push :{
                        'favourites': itemId                        
                    }
                }
            }
        })
        .then(query =>{
            return updateClient(uid, query);
        })
        .then(result =>{
            return returnResult;
        });
}

async function scrapItem(tokenId, itemId){
    let user = await getClientWithToken(tokenId);
    let removeResult = await updateClient(user._id, {
        $pull: {
            'inventory.keysets': new ObjectID(itemId)
        }
    });
    if(removeResult.result.nModified === 0) {
        return false;
    }
    await updateClient(user._id, {
        $inc:{
            'coins.scrap': 20
        }
    });
    return {
        deleted: itemId,
        gottenBack: 20,
        newCoins: {
            scrap: user.coins.scrap + 20,
            gold: user.coins.gold
        }
    }
}

//#endregion


module.exports = { 
    loginAsUser, changeName, changeDescription,
    convertUserInfoToLite, getUserInfoLite,
    searchUsers, 
    getFriendData, sendFriendRequest, acceptFriendRequest, rejectFriendRequest,
    getFriendStatus, getOnlineFriends, 
    getUserInventory, equipKeyset, equipTheme, equipCase,
    toggleItemFav, scrapItem
};
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const { MongoClient } = require('mongodb');
const { getNewClient } = require('./utils/defaults-factory');
const mongoUrl = process.env.MONGODB_URL;

function insertCollectionOne(collectionName, item){
    return new Promise(async (resolve, reject) =>{
        let client = await MongoClient.connect(mongoUrl);
        try{
            let dbo = await client.db('loki-authdata');
            let collection = await dbo.collection(collectionName);
            let result = await collection.insertOne(item);
            resolve(result);
        }catch(ex){
            reject(ex);
        }finally{
            if(client) client.close();
        }
    });
}

function queryCollectionOne(collectionName, query, projection = {}){
    return new Promise(async (resolve, reject) =>{
        let client = await MongoClient.connect(mongoUrl);
        try{
            let dbo = await client.db('loki-authdata');
            let collection = await dbo.collection(collectionName);
            let item = await collection.findOne(query, {
                projection: projection
            });
            resolve(item);
        }catch(ex){
            reject(ex);
        }finally{
            if(client) client.close();
        }
    });
}

function queryCollectionMany(collectionName, query){
    return new Promise(async (resolve, reject) =>{
        let client = await MongoClient.connect(mongoUrl);
        try{
            let dbo = await client.db('loki-authdata');
            let collection = await dbo.collection(collectionName);
            let items = await collection.find(query).toArray();
            resolve(items);
        }catch(ex){
            reject(ex);
        }finally{
            if(client) client.close();
        }
    });
}

function updateCollectionOne(collectionName, filter, query){
    return new Promise(async (resolve, reject) =>{
        let client = await MongoClient.connect(mongoUrl);
        try{
            let dbo = await client.db('loki-authdata');
            let collection = await dbo.collection(collectionName);
            let result = await collection.updateOne(filter, query);
            resolve(result);
        }catch(ex){
            reject(ex);
        }finally{
            if(client) client.close();
        }
    });
}

function removeFromCollection(collectionName, filter){
    return new Promise(async (resolve, reject) =>{
        let client = await MongoClient.connect(mongoUrl);
        try{
            let dbo = await client.db('loki-authdata');
            let collection = await dbo.collection(collectionName);
            let result = await collection.deleteOne(filter);
            resolve(result);
        }catch(ex){
            reject(ex);
        }finally{
            if(client) client.close();
        }
    });
}

function updateCollectionMany(collectionName, query){
    return new Promise(async (resolve, reject) =>{
        let client = await MongoClient.connect(mongoUrl);
        try{
            let dbo = await client.db('loki-authdata');
            let collection = await dbo.collection(collectionName);
            let result = await collection.updateMany(query);
            resolve(result);
        }catch(ex){
            reject(ex);
        }finally{
            if(client) client.close();
        }
    });
}

function getClientWithUserdata(userData){
    return new Promise(async (resolve, reject) =>{
        let id = userData['sub'];
        let query = { _id: id };
        let client = await MongoClient.connect(mongoUrl);
        try{
            let dbo = await client.db('loki-authdata');
            let collection = await dbo.collection('users');
            let user = await collection.findOne(query);
            if(user){
                //Sketchy, but makes sense. 
                //Only I can query for myself, and if I am querying for myself, I am online
                user.status = 'Online';
                resolve(user);
            }else{
                let newUserItem = getNewClient(id, userData);
                await collection.insertOne(newUserItem);
                resolve(newUserItem);
            }
        }catch(ex){
            reject(ex);
        }finally{
            if(client) client.close();
        }
    });   
}

function getClientWithUserid(userId){
    let query = { _id: userId };
    return queryOneUsersCollection(query);
}

//find with (id | username | name | email)
function getClientWithDescriptor(descriptor){
    let query = {
        $or: [
            {'_id': descriptor},
            {'username': descriptor},
            {'google_account_info.email': descriptor},
            {'google_account_info.name': descriptor}            
        ]
    };

    return new Promise(async (resolve, reject) =>{
        let client = await MongoClient.connect(mongoUrl);
        try{
            let dbo = await client.db('loki-authdata');
            let collection = await dbo.collection('users');
            let users = await collection.find(query).toArray();
            if(users){
                resolve(users);
            }else{
                resolve(false);
            }
        }catch(ex){
            reject(ex);
        }finally{
            if(client) client.close();
        }
    });   
}

function updateClient(id, query){
    return new Promise(async (resolve, reject) =>{
        let client = await MongoClient.connect(mongoUrl);
        try{
            let dbo = await client.db('loki-authdata');
            let collection = await dbo.collection('users');
            let result = await collection.updateOne({ _id: id }, query);

            resolve(result);
        }catch(ex){
            reject(ex);
        }finally{
            if(client) client.close();
        }
    }); 
}

function queryOneUsersCollection(query){
    return new Promise(async (resolve, reject) =>{
        let client = await MongoClient.connect(mongoUrl);
        try{
            let dbo = await client.db('loki-authdata');
            let collection = await dbo.collection('users');
            let user = await collection.findOne(query);
            if(user){
                resolve(user);
            }else{
                resolve(false);
            }
        }catch(ex){
            reject(ex);
        }finally{
            if(client) client.close();
        }
    });   
}

function aggregateCollection(collectionName, pipeline){
    return new Promise(async (resolve, reject) =>{
        let client = await MongoClient.connect(mongoUrl);
        try{
            let dbo = await client.db('loki-authdata');
            let collection = await dbo.collection(collectionName);
            let result = await collection.aggregate(pipeline).toArray();
            resolve(result);
        }catch(ex){
            reject(ex);
        }finally{
            if(client) client.close();
        }
    });   
}

//gets status of friendship
//NO RELATION | PENDING | ACCEPTABLE | FRIENDS | SELF
function determineFriendStatus(requesterId, targetId){
    if(`${requesterId}` === `${targetId}`) return new Promise((resolve, reject) => {resolve('SELF');});

    return Promise.all([
        getClientWithUserid(requesterId),
        getClientWithUserid(targetId),
    ]).then(resArr =>{
            const [requester, target] = resArr;
            //Do string comparision cause objid is funny funny
            let targetIdStr = `${target._id}`;
            let selfIdStr = `${requester._id}`;
            if(requester.friends.map(x => `${x}`).includes(targetIdStr)) return 'FRIENDS';
            if(target.pending_friends.map(x => `${x}`).includes(selfIdStr)) return 'PENDING';
            if(requester.pending_friends.map(x => `${x}`).includes(targetIdStr)) return 'ACCEPTABLE'

            return 'NO RELATION'
        });
}

function getRandomColor(count){
    return new Promise(async (resolve, reject) =>{
        let client = await MongoClient.connect(mongoUrl);
        try{
            let dbo = await client.db('loki-authdata');
            let collection = await dbo.collection('color_to_words');
            let randomColors = await collection.aggregate([
                {
                    $sample:{
                        size: count
                    }
                }
            ]).toArray();

            resolve(randomColors);
        }catch(ex){
            reject(ex);
        }finally{
            if(client) client.close();
        }
    });
}

module.exports = {
    queryCollectionOne, queryCollectionMany, updateCollectionOne, updateCollectionMany,
    insertCollectionOne, aggregateCollection, 
    getClientWithUserdata, getClientWithUserid, updateClient,
    getClientWithDescriptor, determineFriendStatus, getRandomColor,
    removeFromCollection
}
const { ObjectID, MongoClient } = require('mongodb');
const mongoUrl = process.env.MONGODB_URL;

function getItemFromId(id){
    return new Promise(async (resolve, reject) =>{
        let client = await MongoClient.connect(mongoUrl);
        try{
            let dbo = await client.db('loki-authdata');
            let collection = await dbo.collection('items');
            let result = await collection.findOne({'_id': new ObjectID(id)});
            resolve(result);
        }catch(ex){
            reject(ex);
        }finally{
            if(client) client.close();
        }
    }); 
}

module.exports = {
    getItemFromId
}
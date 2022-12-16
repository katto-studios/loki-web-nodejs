const { ObjectID } = require('mongodb');

function getNewClient(id, userData){
    let defaultCase = getDefaultCase();
    let defaultKeyboard = getDefaultKeyboard();
    let defaultTheme = getDefaultTheme();

    return {
        _id: id,
        google_account_info:{
            name: userData.name,
            img_url: userData.picture,
            email: userData.email
        },
        coins: {
            gold: 0,
            scrap: 0
        },
        friends: [],
        pending_friends: [],
        description: '',
        status: 0,
        highest_score : 0,
        highest_wpm : 0,
        total_games_played : 0,
        total_wpm : 0,
        total_score : 0,
        level: 1,
        inventory:{
            keysets: [ defaultKeyboard ],
            themes: [ defaultTheme ],
            cases: [ defaultCase ]
        },
        equiped:{
            theme: defaultTheme,
            keyset: defaultKeyboard,
            case: defaultCase
		},
		username: userData.email.split('@')[0],
        favourites: [],
        redeemedCodes: []
    }
}

function getDefaultKeyboard(){
    return new ObjectID('602a5f1502538f2092c4ce2e');
}

function getDefaultTheme(){
    return new ObjectID('6034d23852a8363ddacd5214');
}

function getDefaultCase(){
    return new ObjectID('604b964572d78ea4e7aaccf3');
}

module.exports = {
    getNewClient
}
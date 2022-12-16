const Random = require('seedrandom');

const POSSIBLE_MODS = [
    'invert'
];

const POSSIBLE_KEY_MODIFIABLE = [
    'all', //all keys
    'alpha', //regular chars
    'space', //space
    'ogMods', //esc space, del
    'modifiers', //alt, control, shift, caps, esc, windows
    'bigs', //alt, control, shift, caps, esc, windows, space, return, tab, del
];

function getRandomMods(num){
    let returnMe = [];
    for(let count = 0; count < num; count++){
        returnMe.push(getRandomMod());
    }
    return returnMe;
}

function getRandomMod(){
    let rng = new Random();
    let modIndex = Math.round(rng() * (POSSIBLE_MODS.length - 1));
    let keysIndex = Math.round(rng() * (POSSIBLE_KEY_MODIFIABLE.length - 1));
    let returnMe = {};
    returnMe[POSSIBLE_MODS[modIndex]] = POSSIBLE_KEY_MODIFIABLE[keysIndex];

    return returnMe;
}

module.exports = { getRandomMods }
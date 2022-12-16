require('dotenv').config();
const { getRandomRarityFromOdds } = require('./server-side-js/gacha-api');

const odds = {
    Epic: 0.7,
    Legendary: 0.3
}
const result = {
    Epic: 0,
    Legendary: 0
}
const iterations = 10000;

for(let count = 0; count < iterations; count++){
    result[getRandomRarityFromOdds(odds)] += 1;
}
for(const key in result){
    result[key] = result[key] / iterations;
}

console.log(result);
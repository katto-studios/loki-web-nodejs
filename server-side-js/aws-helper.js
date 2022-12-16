const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
    region: 'ap-southeast-1'
});

const lambda = new AWS.Lambda();
const params = {
    FunctionName: 'GetRandomColor',
    Payload: JSON.stringify({ maxSaturation: 0.6 })
};

function getRandomColor() {
    return new Promise((resolve, reject) => {
        lambda.invoke(params, function(err, res) {
            if(err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

module.exports = {
    getRandomColor
};
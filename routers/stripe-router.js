const stripe = require('stripe')(process.env.STRIPE_SECRET);
var router = require('express').Router();
const { ObjectID } = require('mongodb');
const { verify } = require('../server-side-js/google-login');
const { updateClient, insertCollectionOne, queryCollectionMany, queryCollectionOne } = require('../server-side-js/mongo-db-helper');

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

router.post('/create-checkout-session', async (req, res) => {
    let tokenId = req.body.idToken;
    let userId = (await verify(tokenId))['sub'];
    let itemId = req.body.type;
    let result = await queryCollectionOne('premiumShopItems', {_id: new ObjectID(itemId)});
    if(!result) {
        console.log(`${itemId} not found!`);
        return false;
    }
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price: result.stripe_id,
            quantity: 1,
        }],
        mode: 'payment',
        success_url: process.env.STRIPE_SUCCESS,
        cancel_url: process.env.STRIPE_FAILURE,
        metadata: {
            userId: userId,
            metaInt: JSON.stringify(result.meta_data)
        }
    });
    res.json({ id: session.id });
});

router.post('/stripe-webhook', async (req, res) => {
    const payload = req.body;
    const signature = req.headers['stripe-signature'];
    //console.log(payload);
    let event;
    try {
        event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            // console.log(session);
            if(session.id == 'cs_00000000000000'){
                res.send(200);
                return;
            }
            await insertCollectionOne('payments', {
                '_id': session.id,
                'currency': session.currency,
                'amount_subtotal': session.amount_subtotal,
                'amount_total': session.amount_total,
                'client_reference_id': session.client_reference_id,
                'customer_id': session.customer, 
                'customer_details': session.customer_details,
                'metadata': session.metadata,
                'payment_intent': session.payment_intent
            });
            await handleSuccessfulPayment(session.metadata);
            res.send(200);
        }else{
            res.status(250);
        }
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

router.get('/shop-items', (req, res) =>{
    queryCollectionMany('premiumShopItems', {'type': process.env.STRIPE_MODE})
        .then(result => {
            res.send(result.map(x => {
                delete(x.meta_data);
                delete(x.stripe_id);
                return x;
            }));
        })
        .catch(err => console.log(err));
})

router.get('/checkout', (req, res) => {
    res.render('checkout');
});

router.get('/success', (req, res) => {
    res.render('payment-success');
});

router.get('/canceled', (req, res) => {
    res.render('payment-failue');
});

function handleSuccessfulPayment(metadata) {
    let userId = metadata.userId;
    let meta = JSON.parse(metadata.metaInt);
    switch(meta.type){
        case 'incGold':
            return giveGoldToUser(userId, meta.amt);
        default:
            console.log(`Unknown type ${type}!`);
            throw `Unknown type ${type}!`;
    }
}

function giveGoldToUser(userId, amt){
    return updateClient(userId, {
        $inc:{
            'coins.gold': amt
        }
    });
}

module.exports = router;
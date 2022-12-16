var stripe = Stripe('pk_live_51IGHt3BDq2VmNjfXXSpmmcWSDSZxUxKu0k0QQeV9OkLjC9FI5mgWdyyaytYHdU8Ze6w8C4bfUIXVsopB1dIPgvbv00CQVHSxbb');

function checkout(type) {
    if(!authedClient) {
        return;
    }
    // $.post('/payments/create-checkout-session', {
    //     idToken:  authedClient.getAuthResponse().id_token,
    //     type: type
    // }, response =>{
    //     stripe.redirectToCheckout({ 
    //         sessionId: response.id,
    //     })
    //     .then(res => console.log(res));
    // });
}

function loadShopItems() {
    // $.get('/payments/shop-items', responseData =>{
    //     let mainShopContainer = $('#modal-shop-content');
    //     responseData.forEach(item =>{
    //         mainShopContainer.append(`
    //             <div class="shop-item" onclick="checkout('${item._id}')">
    //                 <p>${item.name}</p>
    //                 <p>${item.cost}</p>
    //             </div>
    //         `);
    //     })
    // });
}
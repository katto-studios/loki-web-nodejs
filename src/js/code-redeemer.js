var isRedeemingCode = false;

function redeemCodePromise(code){
    return new Promise((resolve, reject) =>{
        try{
            let idToken = authedClient.getAuthResponse().id_token;
            $.post('/user-api/redeem-code', {
                idToken, code
            }, responseData =>{
                resolve(responseData);
            });
        }catch(ex){
            reject(ex)
        }
    });
}

function openRedeemCodeModal(){
    MicroModal.close('modal-logout');
    MicroModal.show('modal-redeem-code');
}

async function redeemCode(){
    if(isRedeemingCode) return;
    let code = $('#redeem-code-input').val();
    $('#redeem-code-button').html('<i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i>');
    isRedeemingCode = true;

    let result = await redeemCodePromise(code);
    MicroModal.close('modal-redeem-code');

    //set new modal values
    $('#modal-redeem-code-result-title').html(result.success ? 'Redeemed successfully!' : 'Redeem failed!');
    $('#redeem-code-result-content').html(result.message);
    //update nav bar
    if(result.success) magicallyGetNewCurrencyValues(result.message);
    //reset values
    $('#redeem-code-button').html('Redeem');
    $('#redeem-code-input').val('');
    MicroModal.show('modal-redeem-code-result');

    isRedeemingCode = false;
}

const magicRegex = /Redeemed <b>(?<code>.*)<\/b> for <b>(?<amt>\d*) (?<type>.*)<\/b>!/gm;
function magicallyGetNewCurrencyValues(message){
    let matches = magicRegex.exec(message);
    if(!matches) return;
    switch(matches.groups.type){
        case 'cash':
            addCashVisual(parseInt(matches.groups.amt));
            break;
        case 'scrap':
            addScrapVisual(parseInt(matches.groups.amt));
            break;
    }
}
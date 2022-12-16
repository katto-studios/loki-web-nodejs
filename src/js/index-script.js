var authedClient;
var eOnLoad = [];

function onLoad(){    
    MicroModal.init();
	Game.init(this);
	loadShopItems();
	awaitMiliseconds(300).then(()=>$('.loading-screen').remove());
}

function awaitMiliseconds (ms){
	return new Promise((res,rej) => {
		setTimeout(res, ms);
	});
}


function onSubmit(token) {
    
}

function handleEndGame(gameData){
	return new Promise ((res, rej)=>{
		try{
			let sendData = {
				idToken: authedClient.getAuthResponse().id_token,
				gameData: gameData
			};
			$.post(`/user-api/end-game`, {
				dataStr: JSON.stringify(sendData)
			}, responseData =>{
				res(responseData);
			});
		} catch (e){
			rej(e);
		}
	});
}
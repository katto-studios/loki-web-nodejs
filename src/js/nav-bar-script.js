var authedClient;
var clientInfoForTheEvent;
var basicProfile;
var eOnAuthenticated = [];
var closeables = document.querySelectorAll('.closable');
var eOnCloseAll = [];
var currentPage = 'GAME';

function onSignIn(client) {
    var data = {
        idToken: client.getAuthResponse().id_token
    };

    basicProfile = client.getBasicProfile();
    $.post(`/user-api/login`, data, responseData => {
        authedClient = client;
        $('#modal-profile-title').html(responseData.username);

        eOnAuthenticated.forEach(x => {
            x(responseData);
        });
        clientInfoForTheEvent = responseData;

        //Note: lmao
        $('#currency').html(`<i class="fas fa-money-bill cash"></i> ${responseData.coins.gold} &emsp;<i class="fas fa-cogs"></i> ${responseData.coins.scrap}`);
        $('#currency').click(goToShop);
        $('#username-level').html(`${responseData.username} LVL ${responseData.level}`);

        $('.profile-info').css('display', 'inline');
        $('.g-signin2').css('display', 'none');

        $('.loading-screen').remove();
    });
}

function logout() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut()
        .then(function() {
            window.location = '/';
        });
}

function switchToGame() {
    closeAll();
    reloadGame();
    $('.game-view-holder').css('display', 'grid');
    currentPage = 'GAME';
    Game.canType = true;
}

function switchToMultiplayerGame() {
    closeAll();
    reloadMultiplayerGame();
    $('.game-view-holder').css('display', 'grid');
    currentPage = 'MULTI_GAME';
    Game.canType = true;
}

function switchToProfile() {
    closeAll();
    $('.self-profile-partial').css('display', 'grid');
    currentPage = 'PROFILE';
}

function switchToFriends() {
    closeAll();
    $('.friends-partial').css('display', 'block');
    onLoadFriends();
    currentPage = 'FRIENDS';
}

function switchToGacha() {
    closeAll();
    $('.gacha-partial').css('display', 'grid');
    onLoadGacha();
    currentPage = 'GACHA';
}

function switchToInventory() {
    closeAll();
    $('.inventory-partial').css('display', 'block');
    onLoadInventory();
    currentPage = 'INVEN';
}

function switchToMultiplayer() {
    closeAll();
    $('.multiplayer-partial').css('display', 'grid');
    onLoadMultiplayerLobby();
    currentPage = 'MULTI';
}

function switchToLeaderboards() {
    closeAll();
    $('.leaderboards-partial').css('display', 'block');
}

function closeAll() {
    if(window.location.pathname !== '/') {
        window.location = '/';
    } else {
        closeables.forEach(x => {
            x.style.display = 'none';
        });

        reloadKeyset();
        Game.forceStop();

        eOnCloseAll.forEach(x => x());

        try { MicroModal.close(); } catch(e) {};
    }
    Game.canType = false;
}

function goToShop() {
    // MicroModal.show('modal-shop');
}

function addScrapVisual(amtToAdd) {
    clientInfoForTheEvent.coins.scrap += amtToAdd;
    refreshNavBar();
}

function addCashVisual(amtToAdd) {
    clientInfoForTheEvent.coins.gold += amtToAdd;
    refreshNavBar();
}

function refreshNavBar() {
    $('#currency').html(`<i class="fas fa-money-bill cash"></i> ${clientInfoForTheEvent.coins.gold} &emsp;<i class="fas fa-cogs"></i> ${clientInfoForTheEvent.coins.scrap}`);
}

function disableNavBar() {
    $('#switch-to-game-btn').attr('onclick', '');
    $('#switch-to-multi-btn').attr('onclick', '');
    $('#switch-to-friends-btn').attr('onclick', '');
    $('#switch-to-inven-btn').attr('onclick', '');
    $('#switch-to-gacha-btn').attr('onclick', '');
    $('#switch-to-leaderboards-btn').attr('onclick', '');
    $('#username-level').attr('onclick', '');
}

function enableNavBar() {
    $('#switch-to-game-btn').attr('onclick', 'switchToGame()');
    $('#switch-to-multi-btn').attr('onclick', 'switchToMultiplayer()');
    $('#switch-to-friends-btn').attr('onclick', 'switchToFriends()');
    $('#switch-to-inven-btn').attr('onclick', 'switchToInventory()');
    $('#switch-to-gacha-btn').attr('onclick', 'switchToGacha()');
    $('#switch-to-leaderboards-btn').attr('onclick', 'switchToLeaderboards()');
    $('#username-level').attr('onclick', `MicroModal.show('modal-logout')`);
}
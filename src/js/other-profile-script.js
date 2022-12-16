//NO RELATION | PENDING | ACCEPTABLE | FRIENDS
var pageUserId;

function onLoad(userId){
    pageUserId = userId
    $('.profile-container').css('opacity', '1');
    getAndLoadKeyboardAndTheme(userId);
    eOnAuthenticated.push(setFriendStatus);
}

function setFriendStatus(client){
    $.post('/user-api/friend-status', {
        idToken: authedClient.getAuthResponse().id_token,
        otherUser: pageUserId
    }, handleFriendStatus);
}

function handleFriendStatus(status){
    let friendStatusDOM = $('#friend-status');
    switch(status){
        case 'ACCEPTABLE':
            friendStatusDOM.html('Accept friend request?   <span onclick="acceptFriendRequest()">✅</span>   <span onclick="rejectFriendRequest()">❎</span>');
            break;
        case 'FRIENDS':
            friendStatusDOM.html('Already friends ❤');
            break;
        case 'NO RELATION':
            friendStatusDOM.html('<button onclick="sendFriendRequest()">Send friend request?</button>');
            break;
        case 'PENDING':
            friendStatusDOM.html('Friend request pending🤞...');
            break;
    }
}

function rejectFriendRequest(){
    $.post(`/user-api/reject-friend-request`,{
        idToken: authedClient.getAuthResponse().id_token,
        target: pageUserId
    }, responseData => location.reload());
}

function acceptFriendRequest(){
    $.post(`/user-api/accept-friend-request`,{
        idToken: authedClient.getAuthResponse().id_token,
        target: pageUserId
    }, responseData => location.reload());
}

function sendFriendRequest(){
    $.post(`/user-api/send-friend-request`, {
        idToken: authedClient.getAuthResponse().id_token,
        target: pageUserId
    }, responseData => location.reload());
}
function onInviteFriend(){
    $.post('/user-api/get-online-friends', {
        idToken: authedClient.getAuthResponse().id_token
    }, result =>{
        const modalContent = $('#modal-friends-online-content');
        modalContent.empty();
        result.forEach(friend => {
            modalContent.append(`
                <div class="friends-online" onclick="inviteFriend('${friend.uid}')">
                    <img src="${friend.profileImg}"/>
                    <h1>${friend.username}</h1>
                </div>
            `);
        });
        MicroModal.show('modal-friends-online');
    });
}

function inviteFriend(friendId){
    socket.emit('invite-friend', {
        target: friendId
    });
}
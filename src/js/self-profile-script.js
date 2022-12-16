window.addEventListener('load', ()=>{
    if(!clientInfoForTheEvent){
        eOnAuthenticated.push(loadProfile);
    }else{
        loadProfile(clientInfoForTheEvent);
    }
});

function loadProfile(client){
    let imageUrl = basicProfile.getImageUrl();

    $('#profile-image').attr('src', imageUrl);
    $('#username').html(`${client.username}  <i class="far fa-edit edit-icon" onclick="editUsername()"></i>`);
    $('#userId').html(client._id);
    $('#description').html(`${client.description === '' ? 'No description' : client.description}  <i class="far fa-edit edit-icon" onclick="editDescription()"></i>`);
    $('#status').html(client.status);

    $.get(`/user-api/get-score-data?userid=${client._id}`, (res) =>{
        $('#highest-score').html(`${res.highestScore}`);
        $('#highest-wpm').html(`${res.highestWpm}`);
        $('#average-score').html(`${res.avgScore}`);
        $('#average-wpm').html(`${res.avgWpm}`);
        $('.profile-container').css('opacity', '1');
    });

    getAndLoadKeyboardAndTheme(client._id);
}

function editUsername(){
    $('#new-name-input').val('');
    MicroModal.show('modal-edit-username');
}

function editDescription(){
    $('#new-description-input').val('');
    MicroModal.show('modal-edit-description');
}

function finalizeNameEdit(){
    let newName = $('#new-name-input').val();
    if(newName === ''){
        console.log('enter something');
        return;
    }

    $.post(`/user-api/change-user-name`, {
        tokenId: authedClient.getAuthResponse().id_token,
        newName: newName
    }, responseData =>{
        $('#username').html(`${newName}  <i class="far fa-edit edit-icon" onclick="editUsername()"></i>`);
        MicroModal.close('modal-edit-username');
    });
}

function finalizeDescriptionEdit(){
    let newDesc = $('#new-description-input').val();

    $.post(`/user-api/change-user-description`, {
        tokenId: authedClient.getAuthResponse().id_token,
        newDescription: newDesc
    }, responseData =>{
        $('#description').html(`${newDesc === '' ? 'No description' : newDesc}  <i class="far fa-edit edit-icon" onclick="editDescription()"></i>`);
        MicroModal.close('modal-edit-description');
    });
}

function goToProfile(id){
    window.location = `/users?id=${id}`;
}

function acceptFriendRequest(id){
}

function rejectFriendRequest(id){
}
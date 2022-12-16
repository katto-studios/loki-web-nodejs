// function onload(){
//     onSwitchTab('friends');
//     eOnAuthenticated.push(onAuth);
// }

function onLoadFriends(){
    onSwitchTab('friends');
    onAuth();
}

function onSwitchTab(index){
    let tabcontent = document.getElementsByClassName("tabcontent");
    for (count = 0; count < tabcontent.length; count++) {
        tabcontent[count].style.display = 'none';
      }

    $(`#${index}`).css('display', 'block');
}

function searchForUser(){
    let searchTerm = $('#input-friend-search').val();

    $.post('/user-api/search-user', {searchTerm: searchTerm}, responseData =>{
        let contentGrid = $('#search-content');
        contentGrid.empty();
        responseData.forEach(user => {
            contentGrid.append(
                `<div id="user-${user._id}" class="user-item">
                    <img src="${user.img_url}">
                    <h1 onclick=goToUserPage("${user._id}")>${user.username}</h1>
                </div>`
            );
        });
    });
}

function goToUserPage(id){
    window.location = `/users?id=${id}`;
}

function onAuth(){
    $.post('/user-api/get-friend-data', {
        idToken: authedClient.getAuthResponse().id_token
    }, responseData =>{
        loadFriends(responseData.friends);
        loadPendingFriends(responseData.pending);
    });
}

function loadFriends(friends){
    //populate friends content
    let target = $('#friends-content');
    target.empty();
    friends.forEach(user =>{
        target.append(
            `<div id="friend-${user._id}" class="user-item">
                <img src="${user.img_url}">
                <h1 onclick=goToUserPage("${user._id}")>${user.username}</h1>
            </div>`
        );
    });
}

function loadPendingFriends(pending){
    //populate pending
    let target = $('#requests-content');
    target.empty();
    pending.forEach(user =>{
        target.append(
            `<div id="pending-${user._id}" class="user-item">
                <img src="${user.img_url}">
                <h1 onclick=goToUserPage("${user._id}")>${user.username}</h1>
            </div>`
        );
    });
}
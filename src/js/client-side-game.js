const socket = io();

socket.on('onGetNewWords', onGetNewWords);
socket.on('updateDisplays', updateDisplays);

//Called by input reader
function onKeyDown(key){
    socket.emit('keydown', key);
}

function onGetNewWords(words){
    $('.words').html(words);
}

function updateDisplays(updated){

}
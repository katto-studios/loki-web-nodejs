var popupObject = document.querySelector('#popup');
var popupContent = document.querySelector('#popup #content');
var isPopup = false;
var popupTimeout = false;
var popoutQueue = [];

function showPopup(message, timeout = 4000){
    if(isPopup){
        popoutQueue.push({message, timeout});
        return;
    }
    popupContent.innerHTML = message;
    popupObject.classList.remove('in');
    popupObject.classList.add('out');
    isPopup = true;
    popupTimeout = setTimeout(() => {forceHidePopup()}, timeout);
}

function forceHidePopup(){
    popupObject.classList.remove('out');
    popupObject.classList.add('in');
    isPopup = false;
    if(popupTimeout) clearTimeout(popupTimeout);

    let item = popoutQueue.shift()
    if(item){
        showPopup(item.message, item.timeout);
    }
}
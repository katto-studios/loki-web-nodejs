function trimStartAndEnd(str){
    if (str.charAt(0) === '"' && str.charAt(str.length -1) === '"'){
        return str.substr(1, str.length - 2);
    }

    return str;
}

function getStatusString(timestamp){
    if(timestamp === 0){
        return 'Online';
    }
    //Probably a better way of doing it but /shrug
    let timeDifference = (new Date()).getTime() - timestamp;
    let secondDifference = Math.floor(timeDifference / 1000);
    if(secondDifference < 60) return 'Last seen less than a minute ago';
    let minuteDifference = Math.floor(secondDifference / 60);
    if(minuteDifference < 60) return `Last seen ${minuteDifference} minutes ago`;
    let hourDifference = Math.floor(secondDifference / 3600);
    if(hourDifference < 24) return `Last seen ${hourDifference} hours ago`;
    let dayDifference = Math.floor(hourDifference / 24);
    if(dayDifference < 30) return `Last seen ${dayDifference} days ago`;
    let lastDate = new Date(timestamp);
    let dateFormatOptions = {year: 'numeric', month: 'long', day: 'numeric'};
    return `Last seen on ${new Intl.DateTimeFormat('en-US', dateFormatOptions).format(lastDate)}`;
}

module.exports = {
    trimStartAndEnd, getStatusString
}
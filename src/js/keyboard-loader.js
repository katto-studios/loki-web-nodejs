const POSSIBLE_MODS = [
    'invert'
]

var currentKeyset;
var currentTheme;
var currentCase;

function getAndLoadKeyboardAndTheme(userId){
    // console.log(userId);
    $.get(`/user-api/inventory/equippedFull?id=${userId}`, function(data){
        loadKeyset(data.keyset);
        loadCase(data.case);
        loadTheme(data.theme);
    });
}

function loadKeyset(keysetData){
    currentKeyset = keysetData;
    tempLoadKeyset(keysetData);
}

function tempLoadKeyset(keysetData){
    undoMods();
    undoColors();
    let keyboard = document.querySelectorAll('.keyboard');
    keyboard.forEach(x => {
        let targetStyle = x.style;
        if(keysetData.mods) loadMods(keysetData.mods);
        if(keysetData.colors) loadAdditionalColors(keysetData.colors);
        targetStyle.setProperty(`--keycap-c1`, keysetData['keycap-c1']);
        targetStyle.setProperty(`--keycap-c2`, keysetData['keycap-c2']);
    });
}

function loadMods(modsArr){
    //Apply key to value
    modsArr.forEach(item => {
        for(let key in item){
            $(`.${item[key]}`).addClass(key);
        }
    });
}

function loadAdditionalColors(colorsArr){
    colorsArr.forEach(item => {
        for(let key in item){
            $(`.${key}`).each(function(index, element){
                element.style.setProperty("--keycap-c1", item[key].c1);
                element.style.setProperty("--keycap-c2", item[key].c2);
            })
        }
    });
}

function undoMods(){
    POSSIBLE_MODS.forEach(x =>{
        document.querySelectorAll(`.${x}`).forEach(elem =>{
            elem.classList.remove(x);
        })
    })
}

function undoColors(){
    $(`.keycap-row .keycap`).each(function(index, element){
        element.style.setProperty("--keycap-c1", null);
        element.style.setProperty("--keycap-c2", null);
    })
}

function reloadKeyset(){
    loadKeyset(currentKeyset);
}

function reloadTheme(){
    loadTheme(currentTheme);
}

function reloadCase(){
    loadCase(currentCase);
}

function loadTheme(themeData){
    currentTheme = themeData;
    tempLoadTheme(themeData);
}

function tempLoadTheme(themeData){
    let targetStyle = document.documentElement.style;
    for(let key in themeData){
        targetStyle.setProperty(`--${key}`, themeData[key]);
    }
}

function unloadTheme(){
    tempLoadTheme(currentTheme);
}

function loadCase(caseData){
    currentCase = caseData;
    tempLoadCase(caseData);
}

function tempLoadCase(caseData){
    let keyboard = document.querySelectorAll('.keyboard');
    keyboard.forEach(x => {
        let targetStyle = x.style;
        
        targetStyle.setProperty('--case-c1', caseData.c1)
        targetStyle.setProperty('--case-c2', caseData.c2)
    });
}

function unloadCase(){
    tempLoadCase(currentCase);
}

function loadIndividualKeys(){
    //Todo: Artisans
}
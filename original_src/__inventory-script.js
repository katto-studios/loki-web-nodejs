var internalInventoryCache = {};
var internalThemeCache = {};
var internalCaseCache = {};
var currentlySelectedItemId;
var inventory = {
    keysets: [],
    themes: [],
    cases: []
}

var inventoryType = 0; //0=Keysets, 1=Cases, 2=Themes
const INVENTORY_TYPES = [
    'keysets', 'cases', 'themes'
]
const RARITY_PIRORITY = {
    Legendary: 5,
    Epic: 4,
    Rare: 3,
    Common: 2,
    Stock: 1
}

var favouriteItemsArr = [];
var switchedPrev = false;

function onLoadInventory() {
    cancelPreview();
    inventoryType = 0;
    $.post(`/user-api/inventory/get-inventory`, {
        idToken: authedClient.getAuthResponse().id_token
    }, responseData => {
        favouriteItemsArr = responseData.favourites;
        inventory.keysets = responseData.inventory.filter(x => x.type === 'keyset');
        inventory.themes = responseData.inventory.filter(x => x.type === 'theme');
        inventory.cases = responseData.inventory.filter(x => x.type === 'case');
        showInventoryType(0);
    });
}

function showInventoryType(id) {
    cancelPreview();
    if (id < 0 && id > 2) return;
    inventoryType = id;
    switch (id) {
        case 0:
            injectKeysets(inventory.keysets);
            $('.item-name').html(currentKeyset.name);
            $('.item-description').html(getDescription(currentKeyset));
            break;
        case 1:
            injectCases(inventory.cases);
            $('.item-name').html(currentCase.name);
            $('.item-description').html(getDescription(currentCase));
            break;
        case 2:
            injectThemes(inventory.themes);
            $('.item-name').html(currentTheme.name);
            $('.item-description').html(getDescription(currentTheme));
            break;
    }
}

function injectKeysets(keysets) {
    $('#equip-button').hide();
    $('#cancel-button').hide();
    $('#favourite-button').hide();
    $('#scrap-button').hide();
    let element = $('.inventory');
    element.empty();
    internalInventoryCache = {};

    currentlySelectedItemId = keysets[0]._id;
    keysets.sort(sortFunction);
    keysets.forEach(item => {
        internalInventoryCache[item._id] = item;
        let image = `<img src="res/BoxNoCap.png">
        <div class="keycap" id="Q-KEY" style="background-color: ${item['keycap-c1']}; color: ${item['keycap-c2']};box-shadow: 0 0 20px 10px var(--rarity-${item.rarity.toLowerCase()})">Q</div>`;

        element.append(`
            <div id="${item._id}" class="inventory-item" onclick="previewItem('${item._id}')">
                <div class="item-image">
                    ${image}
                </div>
                <h1>${item.name}</h1>
                <p>${item._id}</p>
                ${(favouriteItemsArr.includes(item._id) ? `<span class="fav-star" id="${item._id}-star">★</span>` : '')}
            </div>`
        );
    });

    let gridComputedStyle = window.getComputedStyle(document.querySelector('.inventory'));
    let gridColumnCount = gridComputedStyle.getPropertyValue("grid-template-columns").split(' ').length;

    for (count = keysets.length; count % gridColumnCount !== 0; count++) {
        element.append('<div style="height:300px"></div>')
    }
}

function injectThemes(themes) {
    $('#equip-button').hide();
    $('#cancel-button').hide();
    $('#favourite-button').hide();
    let element = $('.inventory');
    element.empty();
    internalThemeCache = {};

    currentlySelectedItemId = themes[0]._id;
    themes.sort(sortRarity);
    themes.forEach(item => {
        internalThemeCache[item._id] = item;
        let image = `<img src="res/BoxNoCap.png">
        <div class="theme-icon" style="background-color: ${item['c2']};border:5px solid ${item['c1']};color:${item['c1']};box-shadow: 0 0 20px 10px var(--rarity-${item.rarity.toLowerCase()})">abc_</div>`;

        element.append(`
            <div class="inventory-item" onclick="previewItem('${item._id}')">
                <div class="item-image">
                    ${image}
                </div>
                <h1>${item.name}</h1>
                <p>${item._id}</p>
            </div>`
        );
    });

    let gridComputedStyle = window.getComputedStyle(document.querySelector('.inventory'));
    let gridColumnCount = gridComputedStyle.getPropertyValue("grid-template-columns").split(" ").length;

    for (count = themes.length; count % gridColumnCount !== 0; count++) {
        element.append('<div style="height:300px"></div>')
    }
}

function injectCases(cases) {
    $('#equip-button').hide();
    $('#cancel-button').hide();
    $('#favourite-button').hide();
    let element = $('.inventory');
    element.empty();
    internalCaseCache = {};

    currentlySelectedItemId = cases[0]._id;
    cases.sort(sortRarity);
    cases.forEach(item => {
        internalCaseCache[item._id] = item;
        let image = `<img src="res/BoxNoCap.png">
        <div class="case-icon" style="background-color: ${item['c1']};};box-shadow: 0 0 20px 10px var(--rarity-${item.rarity.toLowerCase()})"></div>`;

        element.append(`
            <div class="inventory-item" onclick="previewItem('${item._id}')">
                <div class="item-image">
                    ${image}
                </div>
                <h1>${item.name}</h1>
                <p>${item._id}</p>
            </div>`
        );
    });

    let gridComputedStyle = window.getComputedStyle(document.querySelector('.inventory'));
    let gridColumnCount = gridComputedStyle.getPropertyValue("grid-template-columns").split(" ").length;

    for (count = cases.length; count % gridColumnCount !== 0; count++) {
        element.append('<div style="height:300px"></div>')
    }
}

function previewItem(itemId) {
    switch (inventoryType) {
        case 0:
            previewItemKeyset(internalInventoryCache[itemId]);
            break;
        case 1:
            previewItemCase(internalCaseCache[itemId]);
            break;
        case 2:
            previewItemTheme(internalThemeCache[itemId]);
            break;
    }
}

function previewItemKeyset(tempKeyset) {
    if (tempKeyset._id === currentKeyset._id) {
        //Hide everything if current keyboard is being previewed
        $('#equip-button').hide();
        $('#cancel-button').hide();
        $('#favourite-button').hide();
        $('#scrap-button').hide();
    } else {
        $('#equip-button').show();
        $('#cancel-button').show();
        $('#favourite-button').show();
        if (favouriteItemsArr.includes(tempKeyset._id)) {
            $('#favourite-button').html('Unfavourite');
            $('#scrap-button').hide();
        } else {
            $('#favourite-button').html('Favourite');
            $('#scrap-button').show();
        }
    }
    if(tempKeyset.rarity === 'Stock') $('#scrap-button').hide();

    switchedPrev = false;
    tempLoadKeyset(tempKeyset);
    currentlySelectedItemId = tempKeyset._id;
    $('.item-name').html(tempKeyset.name);
    $('.item-description').html(getDescription(tempKeyset));
}

function previewItemTheme(tempTheme) {
    if (tempTheme === currentTheme) {
        $('#equip-button').hide();
        $('#cancel-button').hide();
        $('#scrap-button').hide();
    } else {
        $('#equip-button').show();
        $('#cancel-button').show();
    }
    tempLoadTheme(tempTheme);
    currentlySelectedItemId = tempTheme._id;
    $('.item-name').html(tempTheme.name);
    $('.item-description').html(getDescription(tempTheme));
}

function previewItemCase(tempCase) {
    if (tempCase === currentCase) {
        $('#equip-button').hide();
        $('#cancel-button').hide();
        $('#scrap-button').hide();
    } else {
        $('#equip-button').show();
        $('#cancel-button').show();
    }
    tempLoadCase(tempCase);
    currentlySelectedItemId = tempCase._id;
    $('.item-name').html(tempCase.name);
    $('.item-description').html(getDescription(tempCase));
}

function getDescription(item){
    let descriptionString = '';
    descriptionString += `<span class="description-tag" style="background-color:var(--rarity-${item.rarity.toLowerCase()})">${item.rarity}</span> <span class="description-tag">${item.collection}</span> <br>`;
    descriptionString += item.description;
    return descriptionString;
}

function cancelPreview() {
    switch (inventoryType) {
        case 0:
            previewItemKeyset(currentKeyset);
            break;
        case 1:
            previewItemCase(currentCase);
            break;
        case 2:
            previewItemTheme(currentTheme);
            break;
    }
}

function equipCurrent() {
    switch (inventoryType) {
        case 0:
            $.post(`/user-api/inventory/equip-keyset`, {
                idToken: authedClient.getAuthResponse().id_token,
                itemId: currentlySelectedItemId
            }, responseData => {
                currentKeyset = internalInventoryCache[currentlySelectedItemId];
                reloadKeyset();
                $('#equip-button').hide();
                $('#cancel-button').hide();
                $('#scrap-button').hide();
            });
            break;
        case 1:
            $.post(`/user-api/inventory/equip-case`, {
                idToken: authedClient.getAuthResponse().id_token,
                itemId: currentlySelectedItemId
            }, responseData => {
                currentCase = internalCaseCache[currentlySelectedItemId];
                reloadCase();
                $('#equip-button').hide();
                $('#cancel-button').hide();
            });
            break;
        case 2:
            $.post(`/user-api/inventory/equip-theme`, {
                idToken: authedClient.getAuthResponse().id_token,
                itemId: currentlySelectedItemId
            }, responseData => {
                currentTheme = internalThemeCache[currentlySelectedItemId];
                reloadTheme();
                $('#equip-button').hide();
                $('#cancel-button').hide();
            });
            break;
    }
}

function sortFunction(x, y){
    let isXIn = favouriteItemsArr.includes(x._id);
    let isYIn = favouriteItemsArr.includes(y._id);
    if(isXIn === isYIn) return sortRarity(x, y);
    return isXIn ? -1 : 1;
}

function sortRarity(x, y){
    let xRarity = RARITY_PIRORITY[x.rarity];
    let yRarity = RARITY_PIRORITY[y.rarity];
    if(xRarity === yRarity) return 0;
    return xRarity > yRarity ? -1 : 1;
}

function setFavourite() {
    $('#favourite-button').html('<i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i>');
    switchedPrev = true;
    $.post('/user-api/inventory/set-favourite', {
        idToken: authedClient.getAuthResponse().id_token,
        itemId: currentlySelectedItemId
    }, responseData => {
        switch(responseData.result){
            case 'unfaved':
                favouriteItemsArr = favouriteItemsArr.filter(x => x === responseData.itemId);
                $(`#${responseData.itemId}-star`).remove();
                if (switchedPrev) {
                    $('#favourite-button').html('Favourite');
                }
                break;
            case 'faved':
                favouriteItemsArr.push(responseData.itemId);
                $(`#${responseData.itemId}`).append(`<span class="fav-star" id="${responseData.itemId}-star">★</span>`);
                if (switchedPrev) {
                    $('#favourite-button').html('Unfavourite');
                }
                break;
        }
    })
}

function scrapItem(){
    $('#scrap-confirm').html('<i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i>');
    $('#scrap-confirm').off();
    switchedPrev = true;
    $.post('/user-api/inventory/scrap-item', {
        idToken: authedClient.getAuthResponse().id_token,
        itemId: currentlySelectedItemId
    }, responseData =>{
        $('#scrap-confirm').html(`+${responseData.gottenBack}`);
        MicroModal.close('modal-confirm-scrap');
        $(`#${responseData.deleted}`).remove();
        cancelPreview();
        if(switchedPrev) $('#scrap-button').hide();
    });
}

function confirmScrapItem(){
    if(internalInventoryCache[currentlySelectedItemId].rarity === 'Stock') {
        return;
    }
    $('#scrap-confirm').html('Confirm');
    MicroModal.show('modal-confirm-scrap');
}
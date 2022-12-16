var slideIndex = 1;
var gachaData = [];
var isGachaing = false;
const typeToIconStr = {
    scrap: '<i class="fas fa-cogs"></i>',
    gold: '<i class="fas fa-money-bill cash"></i>'
};
const legendaryNode = { name: 'Legendary', colorVar: '--rarity-legendary', next: null };
const epicNode = { name: 'Epic', colorVar: '--rarity-epic', next: legendaryNode };
const rareNode = { name: 'Rare', colorVar: '--rarity-rare', next: epicNode };
const commonNode = { name: 'Common', colorVar: '--rarity-common', next: rareNode };
const stockNode = { name: 'Stock', colorVar: '--rarity-stock', next: commonNode };

const caseSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
<g id="Path_1" data-name="Path 1" fill="#2c2c2c">
  <path d="M 195 53 L 5 53 L 5 5 L 195 5 L 195 53 Z" stroke="none"/>
  <path d="M 10 10 L 10 48 L 190 48 L 190 10 L 10 10 M 0 0 L 200 0 L 200 58 L 0 58 L 0 0 Z" stroke="none" fill="#c1c1c1"/>
</g>
<g id="Rectangle_2" data-name="Rectangle 2" transform="translate(0 58)" fill="#050505" stroke="#8e8e8e" stroke-width="10">
  <rect width="200" height="92" stroke="none"/>
  <rect x="5" y="5" width="190" height="82" fill="none"/>
</g>
<rect id="Rectangle_3" data-name="Rectangle 3" width="200" height="8" transform="translate(0 96)" fill="#8e8e8e"/>
<g id="Rectangle_4" data-name="Rectangle 4" transform="translate(78 92)" fill="#8e8e8e" stroke="#707070" stroke-width="2">
  <rect width="45" height="24" stroke="none"/>
  <rect x="1" y="1" width="43" height="22" fill="none"/>
</g>
<circle id="Ellipse_1" data-name="Ellipse 1" cx="3" cy="3" r="3" transform="translate(97 99)" fill="#333"/>
<rect id="Rectangle_5" data-name="Rectangle 5" width="2" height="6" transform="translate(99 104)" fill="#333"/>
</svg>
`;

function onLoadGacha() {
    $.get('/user-api/gacha/avaliable-rolls')
        .then(res => {
            let slideShow = $('.slideshow-container');
            let dots = $('#gacha-dots-circles');
            slideShow.empty();
            dots.empty();

            for(let count = 0; count < res.length; count++) {
                slideShow.append(`
                    <div class="mySlides fade">
                        <div class="numbertext">${count + 1} / ${res.length}</div>
                        <img src="${res[count].banner}">
                    </div>
                `);

                dots.append(`
                    <span class="dot" onclick="currentSlide(${count + 1})"></span>
                `);
            }

            slideShow.append(`<a class="prev" onclick="plusSlides(-1)">&#10094;</a>
			<a class="next" onclick="plusSlides(1)">&#10095;</a>`);

            gachaData = res;
            showSlides(slideIndex);
        });
}

function gacha() {
    if(isGachaing) return;
    isGachaing = true;
    $.post(gachaData[slideIndex - 1].endpoint, {
        idToken: authedClient.getAuthResponse().id_token
    }, responseData => {
        let item = responseData.item;
        isGachaing = false;
        gachaBox(item).then(() => {
            switch(item.type) {
                case 'keyset':
                    gachaedKeycap(item, responseData.isDupe);
                    break;
                case 'theme':
                    gachaedTheme(item, responseData.isDupe);
                    break;
                case 'case':
                    gachaedCase(item, responseData.isDupe);
                    break;
                default:
                    console.error(`Unknown type ${item.type}`);
                    break;
            }
        });
        //Update navbar
        addCashVisual(responseData.coinChange.gold);
        addScrapVisual(responseData.coinChange.scrap);
        MicroModal.show('modal-gacharesult');
    });
}

function gachaedKeycap(item, isDupe) {
    let image = `<img src="res/BoxNoCap.png">
        <div class="keycap" id="Q-KEY" style="background-color: ${item['keycap-c1']}; color: ${item['keycap-c2']};box-shadow: 0 0 20px 10px var(--rarity-${item.rarity.toLowerCase()})">Q</div>`;
    $('#gacharesult').html(`
    <div id="${item._id}" class="inventory-item" onclick="previewItem('${item._id}')">
        <div class="item-image">
            ${image}
        </div>
        <h1>${item.name} ${isDupe ? ' (Duplicate!)' : ''}</h1>
        <p>${item._id}</p>
    </div>`
    );

    return animateCSS('#gacharesult', 'zoomIn');
}

function gachaedCase(item, isDupe) {
    $('#gacharesult').html(`
        <div class="inventory-item gacha" onclick="equipItem('${item._id}')">
            <div class="item-image">
            <img src="res/BoxNoCap.png">
            <div class="case-icon" style="background-color: ${item['c1']};};box-shadow: 0 0 20px 10px var(--rarity-${item.rarity.toLowerCase()})"></div>
            </div>
            <br>
            <h1 style="color:var(--rarity-${item.rarity.toLowerCase()})">${item.name} ${isDupe ? 'Dupe!' : ''}</h1>
            <p>${item._id}</p>
        </div>
    `);
    return animateCSS('#gacharesult', 'zoomIn');
};

function gachaedTheme(item, isDupe) {
    $('#gacharesult').html(`
        <div class="inventory-item gacha" onclick="equipItem('${item._id}')">
            <div class="item-image">
            <img src="res/BoxNoCap.png">
            <div class="theme-icon" style="background-color: ${item['c2']};border:5px solid ${item['c1']};color:${item['c1']};box-shadow: 0 0 20px 10px var(--rarity-${item.rarity.toLowerCase()})">abc_</div>
            </div>
            <br>
            <h1 style="color:var(--rarity-${item.rarity.toLowerCase()})">${item.name} ${isDupe ? 'Dupe!' : ''}</h1>
            <p>${item._id}</p>
        </div>
    `);
    return animateCSS('#gacharesult', 'zoomIn');
};

function gachaBox(item) {
    function doNodeAnimation(element, animation, node, delay, action) {
        if(node.next && node.name !== item.rarity) {
            return waitForMs(delay)
                .then(() => {
                    return animateGivenElement(element, animation);
                })
                .then(() => {
                    return waitForMs(50);
                })
                .then(() => {
                    action(node.next);
                    return doNodeAnimation(element, animation, node.next, delay, action);
                });
        }
        return waitForMs(delay)
            .then(() => {
                return animateGivenElement(element, animation);
            })
            .then(() => {
                return waitForMs(50);
            });
    }

    let targetJQElement = $('#gacharesult');
    let targetElement = document.querySelector('#gacharesult');

    targetJQElement.html(`
        <div class="item-image">
            <div style="width:200px;height:150px;margin:100px;background-color:var(--rarity-stock);">
            ${caseSvg}
            </div>
        </div>
    `);

    return doNodeAnimation(targetElement, 'shakeX', stockNode, 500, (nextNode) => {
        targetJQElement.html(`
            <div class="item-image">
                <div style="width:200px;height:150px;margin:100px;box-shadow: 0 0 30px 20px var(${nextNode.colorVar});background-color:var(--rarity-stock);">
                    ${caseSvg}
                </div>
            </div>
        `);
    });
}

// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName('mySlides');
    let dots = document.getElementsByClassName('dot');
    if(n > slides.length) {
        slideIndex = 1;
    }
    if(n < 1) {
        slideIndex = slides.length;
    }
    for(i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
    }
    for(i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(' active', '');
    }
    slides[slideIndex - 1].style.display = 'block';
    dots[slideIndex - 1].className += ' active';

    let currentGacha = gachaData[slideIndex - 1];
    // console.log(currentGacha);

    // Update gacha button
    $('#gacha-button').html(`
        ${typeToIconStr[currentGacha.type]} ${currentGacha.cost}
    `);
}
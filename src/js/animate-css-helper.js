function animateCSS(element, animation, prefix = 'animate__'){
    return new Promise((resolve, reject) => {
        try{
            const animationName = `${prefix}${animation}`;
            const node = document.querySelector(element);

            node.classList.add(`${prefix}animated`, animationName);

            function handleAnimationEnd(event) {
                event.stopPropagation();
                node.classList.remove(`${prefix}animated`, animationName);
                resolve('Animation ended');
            }

            node.addEventListener('animationend', handleAnimationEnd, { 
                once: true
            });
        }catch(ex) {
            reject(ex);
        }
    });
}

function animateGivenElement(node, animation, prefix = 'animate__'){
    return new Promise((resolve, reject) => {
        try{
            const animationName = `${prefix}${animation}`;
            node.classList.add(`${prefix}animated`, animationName);

            function handleAnimationEnd(event) {
                event.stopPropagation();
                node.classList.remove(`${prefix}animated`, animationName);
                resolve();
            }

            node.addEventListener('animationend', handleAnimationEnd, { 
                once: true
            });
        }catch(ex) {
            reject(ex);
        }
    });
}

function waitForMs(delay){
    return new Promise((resolve, reject) =>{
        try{
            setTimeout(resolve, delay);
        }catch(ex){
            reject(ex);
        }
    });
}
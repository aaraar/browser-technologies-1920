if (document.getElementById('begin')) {
    console.log ( 'index Page' );
    document.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();
        // console.log(e.target.elements.namedItem('uuid').value);
        throwLoadingState(getAllUserData(e.target.elements.namedItem('uuid').value))
    }, false)
}

function getAllUserData ( uuid ) {
    return new Promise ( ( resolve, reject ) => {
        fetch ( '/all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify ( {
                'uuid': uuid
            } )
        } )
            .then ( res => {
                if ( res.ok ) {
                    resolve ( res.json () );
                } else {
                    reject ( res )
                }
            } );
    } )
}

function throwLoadingState(promise) {
    return new Promise ( (resolve, reject) => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin:auto;background:transparent;display:block;" width="201px" height="201px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
<g transform="translate(0 -6)">
  <circle cx="50" cy="42.8" r="5.84999" fill="#ffa57a" transform="rotate(271.8 50 50)">
    <animateTransform attributeName="transform" type="rotate" dur="1.6949152542372878s" repeatCount="indefinite" keyTimes="0;1" values="0 50 50;360 50 50"></animateTransform>
    <animate attributeName="r" dur="1.6949152542372878s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" values="0;12;0" keySplines="0.2 0 0.8 1;0.2 0 0.8 1"></animate>
  </circle>
  <circle cx="50" cy="42.8" r="6.15001" fill="#005a85" transform="rotate(451.8 50 50)">
    <animateTransform attributeName="transform" type="rotate" dur="1.6949152542372878s" repeatCount="indefinite" keyTimes="0;1" values="180 50 50;540 50 50"></animateTransform>
    <animate attributeName="r" dur="1.6949152542372878s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" values="12;0;12" keySplines="0.2 0 0.8 1;0.2 0 0.8 1"></animate>
  </circle>
</g>
</svg>`;
        const loadingModal = createNodeFromString(`<div class="modal"><div class="loading">${svg}</div></div>`);
        document.querySelector('body').prepend(loadingModal);
        promise().then(data => {
                const modal = document.querySelector('modal');
                // while (modal.firstChild) {
                //     modal.removeChild(modal.lastChild);
                // }
                modal.parentElement.removeChild(modal);
                console.log ( data )
            }
        );
    })
}

/**
 *
 * @param string
 */
function createNodeFromString (string) {
    const wrapper = document.createElement('template');
    wrapper.innerHTML = string.trim();
    return wrapper.firstChild
}
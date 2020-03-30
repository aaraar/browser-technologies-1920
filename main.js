import q1Fn     from './views/pe/q1.pug';
import q2Fn     from './views/pe/q2.pug';
import q3Fn     from './views/pe/q3.pug';
import q4Fn     from './views/pe/q4.pug';
import q5Fn     from './views/pe/q5.pug';
import finishFn from './views/pe/finish.pug';
import doneFn   from './views/pe/done.pug';
import 'whatwg-fetch'

let isMobile = false;
document.addEventListener('touchstart', () => {
    isMobile = true;
});

const templates = {
    q1Fn: q1Fn,
    q2Fn: q2Fn,
    q3Fn: q3Fn,
    q4Fn: q4Fn,
    q5Fn: q5Fn,
    finishFn: finishFn,
    doneFn: doneFn,
};

init ( true );

/**
 *
 */
function init ( initial = false ) {
    if ( !initial ) {
        handleNetStates ();
    }
    if ( checkStorage () && initial ) {
        throwLoadingState ( () => {
            return getStorage ();
        } )
            .then ( data => {
                sendData ( data );
                renderPage ( data );
                init ( false );
            } )
    } else {
        if ( document.getElementById ( 'begin' ) ) {
            console.log ( 'index Page' );
            document.querySelector ( 'form' ).addEventListener ( 'submit', e => {
                e.preventDefault ();
                throwLoadingState ( () => {
                    return getAllUserData ( e.target.elements.namedItem ( 'uuid' ).value );
                } )
                    .then ( data => {
                        storeData ( data );
                        renderPage ( data );
                        init ( false );
                    } )
            }, false )
        } else {
            console.log ( 'Question Page' );
            activatePrevNext ();
            transformNumberToRange ();
            watchForm ();
        }
    }
}

function renderPage ( data, fromBegin = true ) {
    const title = `Vraag ${ data.state[ 1 ] }`;
    if ( data[ data.state ] ) {
        renderBody ( templates[ `${ data.state }Fn` ] ( {
            title: `${ title } | WebDev Enquete`,
            pageTitle: title,
            progress: data.state.substring ( 1 ),
            uuid: data.uuid,
            data: data[ data.state ]
        } ) )
    } else if ( data.state === 'finish' ) {
        renderBody ( templates[ `${ data.state }Fn` ] ( {
            title: `Afronden | WebDev Enquete`,
            pageTitle: 'Afronden',
            progress: data.state.substring ( 1 ),
            uuid: data.uuid,
            data: data
        } ) )
    } else if ( data.state === 'done' ) {
        const doneTitle = fromBegin ? 'Nogmaals bedankt' : 'Bedankt';
        renderBody ( templates[ `${ data.state }Fn` ] ( {
            title: `${ doneTitle } | WebDev Enquete`,
            pageTitle: doneTitle,
            progress: 6,
            uuid: data.uuid,
            fromBegin: fromBegin
        } ) );
        clearStorage ();
    } else {
        renderBody ( templates[ `${ data.state }Fn` ] ( {
            title: `${ title } | WebDev Enquete`,
            pageTitle: title,
            progress: data.state.substring ( 1 ),
            uuid: data.uuid
        } ) );
    }
}

/**
 *
 * @param uuid
 * @returns {Promise<unknown>}
 */
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

/**
 *
 * @param promise
 * @returns {Promise<unknown>}
 */
function throwLoadingState ( promise ) {
    return new Promise ( ( resolve, reject ) => {
        const body = document.querySelector ( 'body' );
        const header = body.querySelector ( 'header' );
        const main = body.querySelector ( 'main' );
        const footer = body.querySelector ( 'footer' );
        toggleBlurClass ( header, main, footer );
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
        const loadingModal = createNodeFromString ( `<div class="modal"><div class="loading">${ svg }</div></div>` );
        body.appendChild ( loadingModal );
        promise ()
            .then ( ( data ) => {
                toggleBlurClass ( header, main, footer );
                removeElement ( loadingModal );
                resolve ( data )
            } )
            .catch ( ( err ) => {
                toggleBlurClass ( header, main, footer );
                removeElement ( loadingModal );
                reject ( err )
            } );
    } )
}

/**
 *
 * @param markup
 */
function createNodeFromString ( markup ) {
    const template = document.createElement ( 'template' );
    template.insertAdjacentHTML ( 'afterbegin', markup.trim () );
    return template.firstElementChild;
}

function renderBody ( markup ) {
    const app = document.querySelector ( '.app' );
    clearElement ( app );
    app.insertAdjacentHTML ( 'afterbegin', markup.trim () )
}

function removeElement ( el ) {
    el.parentElement.removeChild ( el );
}

function clearElement ( el ) {
    while ( el.firstChild ) {
        el.removeChild ( el.lastChild );
    }
}

function toggleBlurClass ( ...els ) {
    els.forEach ( el => {
        el.classList.toggle ( 'blur' );
    } );
}

function activatePrevNext () {
    // if document.querySelector()
    document.querySelector ( 'form' ).addEventListener ( 'submit', ( e ) => {
        let input;
        if ( e.explicitOriginalTarget ) {
            e.preventDefault ();
            input = e.explicitOriginalTarget
        } else if ( document.activeElement.tagName === 'INPUT' ) {
            e.preventDefault ();
            input = document.activeElement
        }
        if ( input ) {
            if ( input.value === 'Volgende vraag' && (e.target.elements.grade.value <= 5 && !e.target.elements.desc.value)) {
                console.log ( "invalid" );
                e.target.classList.toggle('invalidWarning', true);
            } else if ( input.value === 'Volgende vraag') {
                console.log ( "Volgende vraag" );
                getStorage ().then ( user => {
                    console.log ( nextQ ( user.state ) );
                    user.state = nextQ ( user.state );
                    storeData ( user );
                    sendData ( user );
                    renderPage ( user );
                    init ( false );
                } );
            } else if ( input.value === 'Vorige vraag' ) {
                console.log ( "Vorige vraag" );
                getStorage ().then ( user => {
                    console.log ( prevQ ( user.state ) );
                    user.state = prevQ ( user.state );
                    storeData ( user );
                    sendData ( user );
                    renderPage ( user );
                    init ( false );
                } );
            }  else if ( input.value === 'Versturen' ) {
                console.log ( "Versturen" );
                getStorage ().then ( user => {
                    console.log ( 'local state = done' );
                    user.state = 'done';
                    storeData ( user );
                    sendData ( user );
                    renderPage ( user, false );
                    init ( false );
                    clearStorage ();
                } );
            } else {
                console.log ( "Afronden" );
                getStorage ().then ( user => {
                    console.log ( 'finish' );
                    user.state = 'finish';
                    storeData ( user );
                    sendData ( user );
                    renderPage ( user );
                    init ( false );
                } );
            }
        }
    }, false )
}

function watchForm () {
    const form = document.querySelector ( 'form' );
    const state = form.elements.q.value || 'done';
    form.addEventListener ( 'change', ( e ) => {
        updateEntry ( form, state )
    } );
    document.querySelectorAll ( '.desc' ).forEach ( desc => {
        desc.addEventListener ( 'keyup', () => {
            console.log ( "lol" );
            updateEntry ( form, state );
            form.classList.remove('invalidWarning');
        } )
    } )
}

function storeData ( data ) {
    // check if localStorage is available.
    if ( typeof Storage !== 'undefined' ) {
        localStorage.setItem ( 'user', JSON.stringify ( data ) );
        return true;
    }
    return false;
}

function updateEntry ( form, state ) {
    if ( checkStorage () ) {
        getStorage ().then ( user => {
            if ( form.elements.grade ) {
                user[ state ] = {
                    grade: form.elements.grade.value,
                    desc: form.elements.desc.value
                }
            } else {
                user[ state ] = {
                    desc: form.elements.desc.value
                }
            }
            storeData ( user );
        } );
    }
}

function checkStorage () {
    if ( typeof Storage !== 'undefined' ) {
        // check if we have saved data in localStorage.
        const item = localStorage.getItem ( 'user' );
        const entry = item && JSON.parse ( item );

        if ( entry ) {
            // we have valid form data, try to submit it.
            return entry
        }
    } else {
        return false
    }
}

function getStorage () {
    return new Promise ( ( resolve, reject ) => {
        if ( typeof Storage !== 'undefined' ) {
            // check if we have saved data in localStorage.
            const item = localStorage.getItem ( 'user' );
            const entry = JSON.parse ( item );

            if ( entry ) {
                // we have valid form data, try to submit it.
                resolve ( entry );
            } else {
                reject ( 'Entry not found' )
            }
        } else {
            reject ( "No local Storage available" )
        }
    } )
}

function sendData ( data ) {
    if ( data._id ) {
        delete data._id;
    }
    // send ajax request to server
    fetch ( '/update-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify ( data )
    } )
        .then ( ( res ) => {
            if ( res.ok ) {
                console.log ( 'Data saved online' )
            }
        } )
        .catch ( ( error ) => {
            console.warn ( error );
        } );
}

function handleNetStates () {
    if ( navigator.onLine ) {
        netStatus ( 'online' )
    } else {
        netStatus ( 'offline' );
    }
    window.addEventListener ( 'online', () => {
        console.log ( 'online' );
        netStatus ( 'online' );
        getStorage ().then ( user => {
            sendData ( user )
        } );
    } );
    window.addEventListener ( 'offline', () => {
        netStatus ( 'offline' )
    } )
}

function netStatus ( status ) {
    console.log ( status );
    if ( document.getElementById ( 'onlineStatus' ) ) {
        document.getElementById ( 'onlineStatus' ).setAttribute ( 'class', status )
    } else {
        const notice = createNodeFromString ( `<section id="onlineStatus" class="${ status }"><p>💾 You seem to be offline</p> <span>Your data is saved locally and will be saved online when your connection comes back</span></section>` );
        document.querySelector ( 'header' ).insertAdjacentElement ( 'beforeend', notice );
    }
}

function nextQ ( q ) {
    return q[ 0 ] + ( parseInt ( q[ 1 ] ) + 1 );
}

function prevQ ( q ) {
    return q[ 0 ] + ( parseInt ( q[ 1 ] ) - 1 );
}

function clearStorage () {
    if ( typeof Storage !== 'undefined' ) {
        localStorage.clear ();
    }
}

function transformNumberToRange () {
    document.querySelectorAll ( 'input[type="number"]' ).forEach ( number => {
        const nullValue = !!number.value;
        number.type = 'range';
        number.parentElement.classList.add ( 'rangeWrapper' );
        const output = number.value > 0
            ? createNodeFromString ( `<output for="${ number.id }" class="rangeValue" id="${ number.id }Value">${ number.value }</output>` )
            : createNodeFromString ( `<output for="${ number.id }" class="rangeValue" id="${ number.id }Value"></output>` );
        number.insertAdjacentElement ( 'afterend', output );
        number.value = nullValue ? number.value : 1;
        setOutput ( number, output );

        number.addEventListener ( 'click', ( e ) => {
            output.classList.toggle ( 'active', true );
            number.focus();

        } );
        number.addEventListener ( 'mouseover', ( e ) => {
            output.classList.toggle ( 'active', true );
        } );
        number.addEventListener ( 'mouseout', ( e ) => {
            output.classList.toggle ( 'active', false )
        } );
        output.addEventListener ( 'click', ( e ) => {
            output.classList.toggle ( 'active', true );
            number.focus();
        } );
        output.addEventListener ( 'mouseover', ( e ) => {
            output.classList.toggle ( 'active', true );
            number.focus();
        } );
        output.addEventListener ( 'mouseout', ( e ) => {
            output.classList.toggle ( 'active', false )
        } );
        number.addEventListener ( 'touchstart', ( e ) => {
            output.classList.toggle ( 'active', true )
        } );
        document.getElementById ( number.id ).addEventListener ( 'change', ( e ) => {
            setOutput ( number, output )
        } );
        document.getElementById ( number.id ).addEventListener ( 'input', ( e ) => {
            setOutput ( number, output )
        } )
    } )
}

function setOutput ( range, output ) {
    if (isMobile) {
        output.classList.toggle ( 'active', true );
    }
    const value = range.value;
    const min = range.min ? range.min : 0;
    const max = range.max ? range.max : 10;
    const percentage = Number ( ( ( value - min ) * 100 ) / ( max - min ) );
    output.innerText = value;
    output.style.left = `calc(${ percentage }% + (${ 18 - percentage * 0.34 }px))`;
}
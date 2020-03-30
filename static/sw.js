const CORE_ASSETS = [
    '/',
    '/404',
    '/main.js',
    '/styles.css'
];

self.addEventListener ( 'install', ( event ) => {
    const preCache = async () => {
        caches.open ( 'core' )
            .then ( ( cache ) => {
                return cache.addAll ( CORE_ASSETS );
            } );
    };
    event.waitUntil ( preCache ().then ( self.skipWaiting () )
    );
} );

self.addEventListener ( 'fetch', ( event ) => {
    if ( isCoreGetRequest ( event.request.url ) ) {
        event.respondWith (
            caches.open ( 'core' ).then ( ( cache ) => {
                console.log ( 'Core Asset request' );
                cache.match ( event.request.url ).then( res => {
                    if (res) return res;
                    else {
                        return fetch(event.request.url).then((response) => {
                            let responseClone = response.clone();
                            cache.put(event.request.url, responseClone);
                            return response;
                        })
                    }
                })
            } ).catch ( () => {
                return new Response ( 'CORE_ASSETS not found in cache' );
            } )
        )
    }
} );

/**
 *
 * @param request
 * @returns {boolean|boolean}
 */
function isCoreGetRequest ( request ) {
    return request.method === 'GET' && ( request.headers.get ( 'accept' ) !== null && CORE_ASSETS.includes ( getPathName ( request.url ) ) )
}

/**
 *
 * @param requestUrl
 * @returns {string}
 */
function getPathName ( requestUrl ) {
    const url = new URL ( requestUrl );
    return url.pathname
}
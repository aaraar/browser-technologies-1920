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
    if ( isCoreGetRequest ( event.request ) ) {
        event.respondWith (
            caches.open ( 'core' ).then ( ( cache ) => {
                console.log ( 'Core Asset request' );
                return cache.match ( event.request.url )
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
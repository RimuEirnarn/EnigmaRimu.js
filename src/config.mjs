/**
 * Configurations
 */
const config = {
    /** Should download be cached */
    global_download_cache: false,
    /** Used for targeting DOMs*/
    target: {
        /** Notification target, used by Notification
         * @type {?String}
         */
        notification: null,
        /** App target, used by Page
         * @type {?String}
         */
        app: null,
    },
    /** Should transition() used hash as path? */
    transition_uses_hash: true,

    /** Define application root directory */
    root: null
}

export { config }

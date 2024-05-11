/**
 * @typedef QueueObject
 * @type {object}
 * @property {string} key - Queue Key/id
 * @property {string|Request} req - fetch() URL or Request
 * @property {?RequestOption} opt - fetch() options
 */

/**
 * @typedef DownloadedData
 * @type {object}
 * @property {string} status - Request Status
 * @property {?string} data - requested data
 * @property {?string} type - request data type
 */

/**
 * Wrapper around fetch
 * @typedef {Object.<string, string>} RequestOption
 * @param {string | Request} request fetch() request
 * @param {?RequestOption} option fetch options
 * @returns {Promise.<Response>}
 */
const ft = (request, option) => {
    return new Promise((resolve, reject) => {
        fetch(request, option)
            .then((resp) => resp.ok ? resp : reject(err))
            .then((data) => resolve(data))
            .catch((err) => reject(err))
    })
}

/**
 * DownloadManager
 * @param {Boolean} should_frozen Should queue be frozen? 
 */
const DownloadManager = (should_frozen) => {
    var frozen = false
    /** @type {Array.<QueueObject>} */
    const queue = []
    /**
     * Data after-queue. It may be ongoing or finished
     * @type {Object.<string, DownloadedData>}
    */
    const mapped = {}

    /**
     * @returns {Promise.<Blob|String|any>}
     */
    function ret(i, resp) {
        switch (i.type) {
            case "text":
                return resp.text()
            case "json":
                return resp.json()
            default:
                return resp.blob()
        }
    }

    return {
        /**
        * Set the download queue.
        * @param {Array.<QueueObject>} nqueue 
        */
        setQueue(nqueue) {
            if (!frozen) {
                queue.push(...nqueue)
                frozen = should_frozen ? true : false
                return
            }
            throw new Error("Cannot re-bind queue. Read-only operation.")
        },

        /**
         * Execute download manager
         */
        execute() {
            for (let i of queue) {
                ft(i.req, i.opt)
                    .then((resp) => {
                        mapped[i.key] = {
                            status: 'ok',
                        }
                        ret(i, resp).then(d => mapped[i.key].data = d)
                    })
                    .catch((resp) => {
                        mapped[i.key] = {
                            status: 'error',
                            data: null
                        }
                    })
            }
            queue.length = 0
        },


        /**
        * Data after-queue. It may be ongoing or finished
        * @type {Object.<string, DownloadedData>}
        */
        get data() { return mapped },

        /** @type {Array.<QueueObject>}*/
        get queue() { return queue.concat([]) }
    }
}

const GDM = DownloadManager(true)

export { DownloadManager, GDM }

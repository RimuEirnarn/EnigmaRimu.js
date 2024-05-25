import { generate_id } from "./utils.mjs"


function hashed() {
    return `id=${Date.now()}/${generate_id(16)}`
}

/**
 * @typedef QueueObject
 * @type {object}
 * @property {string} key - Queue Key/id
 * @property {string|Request} req - fetch() URL or Request
 * @property {string} type - Request file type
 * @property {?RequestOption} opt - fetch() options
 * @property {?Object.<string, string>} misc - Misc. data
 */

/**
 * Download Callback
 *
 * @callback DownloadCallback
 * @param {String | Blob | any} data - Request data
 * @param {QueueObject} Current object data
 */

/**
 * @typedef DownloadedData
 * @type {object}
 * @property {string} status - Request Status
 * @property {?string} data - requested data
 * @property {Promise.<string>} promise - requested data, but as promise
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
 * Prepare a request
 * @param {String} name - Request name
 * @param {String} req_string - Request URL
 * @param {Object.<string, string>} headers - Request Headers
 * @param {Boolean} should_cache - Should request cached?
 * @returns {QueueObject}
 */
function prepare(name, req_string, headers, should_cache = true, misc = null) {
    var reqstr = req_string + (should_cache ? '' : `${req_string.includes('?') ? `&${hashed()}` : `?${hashed()}`}`)

    console.log(misc)
    return {
        key: name,
        req: reqstr,
        opt: headers,
        type: 'text',
        misc: misc
    }
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
     * @returns {<Promise.<Blob|String|any>}
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

    function after_request(i, callback) {
        console.log(i)
        /**
         * @param {Response} response 
         */
        return (response) => {
            mapped[i.key]['status'] = 'ok'
            ret(i, response)
                .then(d => mapped[i.key].data = callback ? callback(d, i) : d)
                .catch(e => console.error(e))
        }
    }

    /**
     * @param {Number} time 
     */
    function _waitfor(time) {
        return new Promise((r) => setTimeout(r, time))
    }

    /**
     * Wrapper around promise
     * @param {Function} resolve
     * @param {Function} reject 
     * @param {Boolean} callback_hell 
     */
    function promised_data(resolve, reject, callback_hell) {
        if (![undefined, null].includes(this.data)) {
            resolve(this.data)
            return
        }
        if (callback_hell === undefined) {
            _waitfor(1000).then(() => promised_data.bind(this)(resolve, reject, false))
            return
        }
        reject("unavailable")
    }

    return {
        /**
        * Set the download queue.
        * @method
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
         * @method
         * @param {DownloadCallback} success_callback 
         */
        execute(success_callback) {
            for (let i of queue) {
                mapped[i.key] = {
                    data: null,
                    status: null,
                    get promise() {
                        return new Promise(promised_data.bind(mapped[i.key]))
                    }
                }
                ft(i.req, i.opt)
                    .then(after_request(i, success_callback))
                    .catch((e) => {
                        console.error(e)
                        mapped[i.key]['status'] = 'error'
                        mapped[i.key]['data'] = e
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
        get queues() { return queue.concat([]) }
    }
}

const GDM = DownloadManager(true)

export { DownloadManager, GDM, prepare }

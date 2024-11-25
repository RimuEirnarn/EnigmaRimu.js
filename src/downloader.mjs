// @ts-check
import { generate_id } from "./utils.mjs"

function hashed() {
    return `id=${Date.now()}/${generate_id(16)}`
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
 * @param {Number} [callback_hell=10]
 * @param {number} [timeout=50]  
 */
function promised_data(resolve, reject, callback_hell = 10, timeout = 50) {
    // @ts-ignore
    if (![undefined, null].includes(this.data)) {
        resolve(this.data)
        return
    }
    if (callback_hell > 1) {
        _waitfor(timeout).then(() => promised_data.bind(this)(resolve, reject, callback_hell - 1))
        return
    }
    reject("unavailable")
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
 * @template D
 * @typedef DownloadedData
 * @type {object}
 * @property {?string} status - Request Status
 * @property {?string} data - requested data
 * @property {Promise.<D>} promise - requested data, but as promise
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
        // @ts-ignore
        fetch(request, option)
            .then((resp) => resp.ok ? resp : reject("Fetch error"))
            .then((data) => data ? resolve(data) : reject("Undefined"))
            .catch((err) => reject(err))
    })
}

/**
 * Prepare a request
 * @param {String} name - Request name
 * @param {String} req_string - Request URL
 * @param {Object.<string, string>} headers - Request Headers
 * @param {Boolean} should_cache - Should request cached?
 * @param {Object.<string, any>} misc Misc data
 * @returns {QueueObject}
 */
function prepare(name, req_string, headers, should_cache = true, misc = {}) {
    var reqstr = req_string + (should_cache ? '' : `${req_string.includes('?') ? `&${hashed()}` : `?${hashed()}`}`)

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
 * @template T
 */
class DownloadManager {
    #frozen
    /** @type {Array.<QueueObject>} */
    #queue
    /**
     * Data after-queue. It may be ongoing or finished
     * @type {Object.<string, DownloadedData<T>>}
     */
    #mapped
    /** @type {boolean} */
    #should_frozen

    /**
     * @param {boolean} [should_frozen]
     */
    constructor(should_frozen = false) {
        this.#frozen = false
        this.#should_frozen = should_frozen
        this.#queue = []
        this.#mapped = {}
    }

    /**
     * @param {QueueObject} obj Object data
     * @param {Response} resp Response
     * @returns {Promise.<Blob|String|any>}
     */
    ret(obj, resp) {
        switch (obj.type) {
            case "text":
                // @ts-ignore
                return resp.text()
            case "json":
                // @ts-ignore
                return resp.json()
            default:
                // @ts-ignore
                return resp.blob()
        }
    }

    /**
     * 
     * @param {QueueObject} obj 
     * @param {Function} callback 
     * @returns 
     */
    after_request(obj, callback) {
        /**
         * @param {Response} response 
         */
        return (response) => {
            this.#mapped[obj.key]['status'] = 'ok'
            this.ret(obj, response)
                .then(d => this.#mapped[obj.key].data = callback ? callback(d, obj) : d)
                .catch(e => console.error(e))
        }
    }

    /**
    * Set the download queue.
    * @param {Array.<QueueObject>} nqueue 
    */
    setQueue(nqueue) {
        if (!this.#frozen) {
            this.#queue.push(...nqueue)
            this.#frozen = this.#should_frozen ? true : false
            return
        }
        throw new Error("Cannot re-bind queue. Read-only operation.")
    }

    /**
     * Execute download manager
     * @param {DownloadCallback} success_callback 
     */
    execute(success_callback) {
        for (let i of this.#queue) {
            // @ts-ignore
            const _md = this.#mapped;
            // @ts-ignore
            this.#mapped[i.key] = {
                data: null,
                status: null,
                get promise() {
                    return new Promise(promised_data.bind(this))
                }
            }
            ft(i.req, i.opt)
                .then(this.after_request(i, success_callback))
                .catch((e) => {
                    console.error(e)
                    this.#mapped[i.key]['status'] = 'error'
                    this.#mapped[i.key]['data'] = e
                })
        }
        this.#queue.length = 0
    }


    /**
    * Data after-queue. It may be ongoing or finished
    * @type {Object.<string, DownloadedData<T>>}
    */
    get data() { return this.#mapped }

    /** @type {Array.<QueueObject>}*/
    get queues() { return this.#queue.concat([]) }
}

const GDM = new DownloadManager(true)

export { DownloadManager, GDM, prepare }

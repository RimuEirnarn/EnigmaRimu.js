// @ts-check
import { generate_id } from "./utils.mjs"

function hashed(use_value = null) {
    const prop = use_value || `${Date.now()}/${generate_id(16)}`
    return `prop_cache=${prop}`
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

    /** @type {string} */
    #dm_key

    /** Determines if current download manager forces all queues to follow its own caching mechanics
     * @type {boolean}
    */
    #use_key_cache

    /**
     * @param {boolean} [should_frozen]
     */
    constructor(should_frozen = false) {
        this.#frozen = false
        this.#should_frozen = should_frozen
        this.#queue = []
        this.#mapped = {}
        this.#dm_key = generate_id(25)
        this.#use_key_cache = false
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
    async execute_async(success_callback) {
        for (let i of this.#queue) {
            if (this.#use_key_cache) {
                // @ts-ignore
                // console.log(i, i.req)
                let base = typeof i.req == 'string' ? i.req : i.req.url
                let uri = base.replace(/prop_cache=[A-Za-z0-9\/]+/, `prop_cache=${this.#dm_key}`);
                // try {
                //     uri = new URL(base)
                // } catch (TypeError) {
                //     uri = new URL(`${location.href.includes('https') ? 'http' : 'https'}://${location.host}/${base}`)
                // }
                // uri.searchParams.set('prop_cache', this.#dm_key)
                console.log(uri)
                if (typeof i.req == 'string')
                    i.req = uri
                if (i.req instanceof Request) {
                    // @ts-ignore
                    const body = i.req.body ? i.req.clone().body : null;

                    i.req = new Request(uri, {
                        method: i.req.method,
                        headers: i.req.headers,
                        body, // Pass the cloned body
                        mode: i.req.mode,
                        credentials: i.req.credentials,
                        cache: i.req.cache,
                        redirect: i.req.redirect,
                        referrer: i.req.referrer,
                        integrity: i.req.integrity,
                    });
                }
            }
            // @ts-ignore
            this.#mapped[i.key] = {
                data: null,
                status: null,
                get promise() {
                    return new Promise(promised_data.bind(this))
                }
            }
            await ft(i.req, i.opt)
                .then(this.after_request(i, success_callback))
                .catch((e) => {
                    console.error(e)
                    this.#mapped[i.key]['status'] = 'error'
                    this.#mapped[i.key]['data'] = e
                })
        }
        if (!this.#use_key_cache)
            this.#queue.length = 0
    }

    /**
     * Execute download manager
     * @param {DownloadCallback} success_callback 
     */
    execute(success_callback) {
        return this.execute_async(success_callback)
    }

    /**
     * Force current download manager to use key-based caching.
     * - Enabled: push_request, edit_request, remove_request
     */
    force_key_caching() {
        this.#use_key_cache = true
    }

    /**
     * Push current request
     * @param {QueueObject} request 
     */
    push_request(request) {
        if (!this.#use_key_cache)
            throw new Error("Only usable by custom caching mechanics")
        this.#queue.push(request)
    }

    /**
     * Edit a request
     * @param {QueueObject} request 
     */
    edit_request(request) {
        if (!this.#use_key_cache)
            throw new Error("Only usable by custom caching mechanics")
        const what = this.#queue.findIndex((val) => val.key == request.key)
        if (what != -1) {
            this.#queue.splice(what, 1, request)
        }
    }

    /**
     * Remove a request
     * @param {QueueObject} request 
     */
    remove_request(request) {
        if (!this.#use_key_cache)
            throw new Error("Only usable by custom caching mechanics")
        const what = this.#queue.findIndex((val) => val.key == request.key)
        if (what != -1) {
            this.#queue.splice(what, 1)
        }
    }

    rehash() {
        this.#dm_key = generate_id(25)
    }

    /**
     * Clear all mapped/downloaded data.
     */
    clear() {
        this.#mapped = {}
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

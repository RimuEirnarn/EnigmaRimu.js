
/**
 * Wrapper around fetch
 * @param {string | Request} request fetch() request
 * @param {Object} option fetch options
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
    const queue = []
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
        setQueue(nqueue) {
            if (!frozen) {
                queue.push(...nqueue)
                frozen = should_frozen ? true : false
                return
            }
            throw new Error("Cannot re-bind queue. Read-only operation.")
        },

        execute() {
            for (let i of queue) {
                ft(i.req, i.opt).then((resp) => {
                    mapped[i.key] = {
                        status: 'ok',
                    }
                    ret(i, resp).then(d => mapped[i.key].data = d)
                })
        }
    },

        get data() { return mapped },

        get queue() { return queue.concat([]) }
}
}

const GDM = DownloadManager(true)

export { DownloadManager, GDM }

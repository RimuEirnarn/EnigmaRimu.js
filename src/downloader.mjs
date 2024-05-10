
/**
 * Wrapper around fetch
 * @param {string | Request} request fetch() request
 * @param {Object} option fetch options
 * @param {string} response type return
 * @returns {Promise.<String|Blob>}
 */
const ft = (request, option, type) => {
    return Promise((resolve, reject) => {
        fetch(request, option)
            .then((resp) => type === 'text' ? resp.text : resp.blob)
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

    return {
        setQueue(nqueue) {
            if (!frozen) {
                queue.concat(nqueue)
                frozen = should_frozen ? true : false
                return
            }
            throw new Error("Cannot re-bind queue. Read-only operation.")
        },

        execute() {
            for (i of queue) {
                ft(i.req, i.opt).then((resp) => {
                    mapped[i.key] = {
                        status: 'ok',
                        data: resp
                    }
                })
            }
        }
    }
}

const GDM = DownloadManager(true)

export { DownloadManager, GDM }

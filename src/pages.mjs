import { transition } from "./transition.mjs"
import { render_template } from "./utils.mjs"
import { DownloadManager, prepare } from "./downloader.mjs"

var initialized = false
const page_dm = DownloadManager(true)

/**
 * Page
 * @param {String} path Page URL path
 * @param {String} data HTML data of the page
 */
const Page = (path, data) => {
    return {
        /**
         * Renders page (after renders the template by the data)
         * @param {Object.<string, string>} template_data 
         */
        render(template_data) {
            transition(path, render_template(data, template_data))
        }
    }
}

/**
 * Setup Pages
 * @param {Object.<string, string>} page_route - All page routes
 */
function setup(page_route) {
    initialized = true
    var queues = []
    for (const path in page_route) {
        if (page_route.hasOwnProperty(path)) {
            const page_url = page_route[path]
            const name = path.replaceAll('/', '_')
            queues.push(prepare(name, page_url, {}, false, {path}))
        }
    }
    page_dm.setQueue(queues)
    page_dm.execute((resp, obj) => {
        if (!['null', 'undefined'].includes(typeof obj.misc))
            return Page(obj.misc.path, resp)
        throw new ReferenceError("Expecting additional data, but obj.misc is undefined")
    })
}

/**
 * goto() URL
 * @param {String} path - URL path
 * @param {?Object.<string, string>} template_data - Template data
 */
function goto(path, template_data) {
    const name = path.replaceAll('/', '_')
    /** @type {Promise.<Page>} */
    const elem = page_dm.data[name].promise
    elem.then(p => p.render(template_data || {}))
        .catch(e => console.error(e))
} 

export { setup, goto, page_dm }

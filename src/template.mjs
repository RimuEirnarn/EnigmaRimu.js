import { DownloadManager } from "./downloader.mjs";

/** @type {JQuery} */
const $ = window.$
const downloader = DownloadManager(false)

/**
 * Known Templates
 * @type {Object.<string, string>}
 */
const KNOWN_TEMPLATES = {}

/**
 * render template
 * @param {String} data - HTML Template code
 * @param {Object.<string, str>} template_data - Template mapping
 * @returns {String}
 */
function render_template(data, template_data) {
    let d = data
    for (let key in template_data) {
        if (template_data.hasOwnProperty(key)) {
            d = d.replaceAll(`$[${key}]`, template_data[key])
        }
    }
    return d
}

/**
 * Template Manager
 * @param {String} name - Template name, it can be used for nesting template rendering
 * @param {String} data - Template data, html template code
 */
function Template(name, data) {
    KNOWN_TEMPLATES[name] = data
    return {
        /**
         * Render this template into a element
         * @method render
         * @param {String} to Target element
         * @param {Object.<string, str>} template_data Template mapping
         */
        render(to, template_data) {
            const elem = document.querySelector(to)
            if (!elem)
                throw new Error(`'${to}' cannot be found.`)

            elem.innerHTML = render_template(data, template_data)
        },

        /**
         * Render and append to an element
         * @method append
         * @param {String} to Target element
         * @param {Object.<string, string} template_data template mapping
         */
        append(to, template_data) {
            /** @type {JQuery?} */
            const element = $(to)
            if (!element)
                throw new Error(`${to} cannot be found`)
            element.append(render_template(data, template_data))
        },
        
        /**
         * Render and prepend to an element
         * @method prepend
         * @param {String} to Target element
         * @param {Object.<string, string} template_data template mapping
         */
        prepend(to, template_data) {
            /** @type {JQuery?} */
            const element = $(to)
            if (!element)
                throw new Error(`${to} cannot be found`)
            element.prepend(render_template(data, template_data))
        }
    }
}

/**
 * Create a template by URL
 * @memberof Template
 * @param {String} name - Template name
 * @param {String|Request} url - fetch() request
 * @param {Number} timeout - Timeout
 * @param {Boolean} refresh - should function refresh the cache
 * @returns {Promise.<Template>}
 */
const Template_with_url = (name, url, timeout = 2500, refresh = false) => {
    if ((KNOWN_TEMPLATES[name] !== undefined) && (!refresh))
        return new Promise((resolve) => resolve(KNOWN_TEMPLATES[name]))
    return new Promise((resolve) => {
        setTimeout(() => {
            downloader.setQueue([{ key: name, req: url, type: 'text' }])
            downloader.execute()
            downloader.data[name].promise
                .then((v) => resolve(Template(name, v)))
                .catch((e) => reject(e))
        }, timeout)
    })
}

Template.with_url = Template_with_url

export { Template, render_template }

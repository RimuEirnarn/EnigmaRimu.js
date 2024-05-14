import { DownloadManager } from "./downloader.mjs";

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
         * @param {String} data - HTML Template code
         * @param {Object.<string, str>} template_data - Template mapping
         */
        render(to, template_data) {
            const elem = document.querySelector(to)
            if (!elem)
                throw new Error(`'${to}' cannot be found.`)

            elem.innerHTML = render_template(data, template_data)
        }
    }
}
console.log(Template)

Template.with_url = (name, url, timeout=2500) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            downloader.setQueue([{key: name, req: url, type: 'text'}])
            downloader.execute()
            downloader.data[name].promise
                .then((v) => resolve(Template(name, v)))
                .catch((e) => reject(e))
        }, timeout)
    })
}

export { Template, render_template }

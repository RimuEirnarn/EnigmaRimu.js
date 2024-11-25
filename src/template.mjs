// @ts-check
import { DownloadManager } from "./downloader.mjs";

/** @type {JQuery} */
// @ts-ignore
const $ = window.$
const downloader = new DownloadManager(false)

/**
 * Known Templates
 * @type {Object.<string, string>}
 */
const KNOWN_TEMPLATES = {}

/**
 * Template Data
 * @typedef {Object.<string, string>} TemplateData
 * @type {object}
 */

/**
 * render template
 * @param {String} data - HTML Template code
 * @param {Object.<string, string>} template_data - Template mapping
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
class Template {
    #data;

    constructor(name, data) {
        KNOWN_TEMPLATES[name] = data
        this.#data = data
    }
    
        /**
         * Render this template into a element
         * @method render
         * @param {String} to Target element
         * @param {TemplateData} template_data Template mapping
         */
        render(to, template_data) {
            const elem = document.querySelector(to)
            if (!elem)
                throw new Error(`'${to}' cannot be found.`)

            elem.innerHTML = render_template(this.#data, template_data)
        }

        /**
         * Render and append to an element
         * @method append
         * @param {String} to Target element
         * @param {TemplateData} template_data template mapping
         */
        append(to, template_data) {
            /** @type {JQuery?} */
            // @ts-ignore
            const element = $(to)
            if (!element)
                throw new Error(`${to} cannot be found`)
            element.append(render_template(this.#data, template_data))
        }
        
        /**
         * Render and prepend to an element
         * @method prepend
         * @param {String} to Target element
         * @param {TemplateData} template_data template mapping
         */
        prepend(to, template_data) {
            /** @type {JQuery?} */
            // @ts-ignore
            const element = $(to)
            if (!element)
                throw new Error(`${to} cannot be found`)
            element.prepend(render_template(this.#data, template_data))
        }

        /**
         * Render all template data arrays and append them to target
         * @method batch_append
         * @param {String} to Target element
         * @param {TemplateData[]} template_data_array 
         */
        batch_append(to, template_data_array) {
            /** @type {JQuery?} */
            // @ts-ignore
            const element = $(to);
            if (!element) throw new Error(`${to} cannot be found`);

            let combinedHtml = template_data_array.map(template_data => render_template(this.#data, template_data)).join("");
            element.append(combinedHtml);
        }

        /**
         * Render all template data arrays and append them to target
         * @method batch_prepend
         * @param {String} to Target element
         * @param {TemplateData[]} template_data_array 
         */
        batch_prepend(to, template_data_array) {
            /** @type {JQuery?} */
            // @ts-ignore
            const element = $(to);
            if (!element) throw new Error(`${to} cannot be found`);

            let combinedHtml = template_data_array.map(template_data => render_template(this.#data, template_data)).join("");
            element.prepend(combinedHtml);
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
        // @ts-ignore
        return new Promise((resolve) => resolve(KNOWN_TEMPLATES[name]))
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // @ts-ignore
            downloader.setQueue([{ key: name, req: url, type: 'text' }])
            // @ts-ignore
            downloader.execute()
            downloader.data[name].promise
                // @ts-ignore
                .then((v) => resolve(new Template(name, v)))
                // @ts-ignore
                .catch((e) => reject(e))
        }, timeout)
    })
}

Template.with_url = Template_with_url

export { Template, render_template }

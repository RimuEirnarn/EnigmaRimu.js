import { GDM } from "./downloader.mjs";


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
        if (object.hasOwnProperty(key)) {
            d = d.replaceAll(`$[${key}]`, template_data)
        }
    }
    return d
}

/**
 * Template Manager
 * @param {String} name - Template name, it can be used for nesting template rendering
 * @param {String} data - Template data, html template code
 */
const Template = (name, data) => {
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

Template.prototype.with_url = (name, url) => {
    
}

export { Template, render_template }

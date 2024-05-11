import { transition } from "./transition.mjs"
import { render_template } from "./utils.mjs"

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

export { Page }

// @ts-check
import { Template } from "./template.mjs";

/**
 * Notification Data, used to push notification.
 * @typedef NotificationData
 * @type {object}
 * @property {string} title - notification title
 * @property {string} body - notification body
 * @property {?Number} time - notification visible time
 */

/**
 * Notification
 */
class Notification {
    /** @type {NotificationData[]} */
    #_history
    /** @type {Template?} */
    #template

    constructor() {
        this.#_history = []
        this.#template = null;
    }
    /**
    * Push Notification and renders it
    * @method
    * @param {NotificationData} data notification data
    */
    push(data) {
        this.#_history.push(data)
        console.log(`${data.title}\n${data.body}`)
    }

    setTemplate(tmpl) {
        this.#template = tmpl
    }

    get history() {
        return this.#_history
    }
}

export { Notification }

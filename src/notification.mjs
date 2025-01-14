// @ts-check
import { config } from "./config.mjs";
import { Template } from "./template.mjs";

const nl_template = new Template("null", "")

/**
 * Notification Data, used to push notification.
 * @typedef NotificationData
 * @type {object}
 * @property {string} body - notification body
 * @property {string?} title - notification title
 * @property {string?} level - notification level (INFO, WARNING, ERROR) 
 * @property {Number?} time - notification visible time
 */

/**
 * Time Formatter Callback
 * @callback timeFormatter
 * 
 * @param {number} time Time
 * @returns {string}
 */

/**
 * Level Formatter Callback
 * @callback levelFormatter
 * 
 * @param {string} level Notification level (INFO, WARNING, ERROR)
 * @returns {string}
 */

/**
 * Notification
 */
class Notification {
    /** @type {NotificationData[]} */
    #_history
    /** @type {Template} */
    #template

    /** @type {timeFormatter} */
    #timeFormatter

    /** @type {levelFormatter} */
    #levelFormatter

    constructor() {
        this.#_history = []
        this.#template = nl_template
        this.#timeFormatter = (time) => time.toString()
        this.#levelFormatter = (level) => `bg-${level}`
    }
    /**
    * Push Notification and renders it
    * @method
    * @param {NotificationData} data notification data
    */
    push(data) {
        this.#_history.push(data)
        if (!this.#template.isEmpty()) {
            if (config.target.notification == null)
                throw new Error("Notification cannot be pushed: No mounting point")
            this.#template.render(config.target.notification, {
                title: data.title || "",
                body: data.body,
                time: this.#timeFormatter(data.time || 0) || "now",
                level: this.#levelFormatter(data.level || 'info')
            })
        }
        console.log(`${data.title}\n${data.body}`)
    }

    /**
     * Set template
     * @param {Template} tmpl 
     */
    setTemplate(tmpl) {
        this.#template = tmpl
    }

    /**
     * Set time formatter template
     * @param {timeFormatter} fmt 
     */
    setTimeFormatter(fmt) {
        this.#timeFormatter = fmt
    }

    get history() {
        return this.#_history
    }
}

export { Notification }

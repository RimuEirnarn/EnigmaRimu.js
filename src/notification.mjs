// @ts-check
import { config } from "./config.mjs";
import { Template } from "./template.mjs";
import { generate_id } from "./utils.mjs";

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

/** Notification data history
 * @typedef NotificationHistory
 * @type {object}
 * 
 * @property {string} body - notification body
 * @property {string?} title - notification title
 * @property {string?} level - notification level (INFO, WARNING, ERROR) 
 * @property {Number?} time - notification visible time
 * @property {string} id notification ID
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
 * Initiator callback
 * @callback initiator
 * 
 * @param {string} notification_id Notification ID
 * @returns {null}
 */

/**
 * Notification.
 * 
 * This class stores information like templating, rendering, and pushing to the host content. Any data is stored in history.
 * 
 * To use the class just do:
 * 
 * ```js
 * const NotificationHandler = new Notification()
 * NotificationHandler.setTemplate(await Template.with_url("toast", "notification.html", 50))
 * NotificationHandler.setInitiator((nid) => {
 *  // activate stuff
 * })
 * NotificationHandler.setTimeFormatter((time) => relativeTime(time))
 * NotificationHandler.push({title: "Hey!", body: "Hello, World!", level: "info", time: now()})
 * ```
 * 
 * Depending on your configurations, title can be optional, including level. Level can be adjusted however you want. Time is also optional.
 * The renderer engine won't be mad at you for giving extra stuff.
 * 
 * You can also configure your template to include nid (notification id) so you can have control over the content. This is why nid is passed to initiator.
 */
class Notification {
  /** @type {NotificationHistory[]} */
  #_history
  /** @type {Template} */
  #template

  /** @type {timeFormatter} */
  #timeFormatter

  /** @type {levelFormatter} */
  #levelFormatter

  /** @type {initiator} */
  #initiator

  constructor() {
    this.#_history = []
    this.#template = nl_template
    this.#timeFormatter = (time) => time.toString()
    this.#levelFormatter = (level) => `bg-${level}`
    this.#initiator = (notification_id) => null
  }
  /**
  * Push Notification and renders it
  * @method
  * @param {NotificationData} data notification data
  */
  push(data) {
    if (!this.#template.isEmpty()) {
      const nid = generate_id(16)
      /** @type {NotificationHistory} */
      // @ts-ignore
      const hist = data
      hist.id = nid
      if (config.target.notification == null)
        throw new Error("Notification cannot be pushed: No mounting point")
      this.#template.render(config.target.notification, {
        title: data.title || "",
        body: data.body,
        time: this.#timeFormatter(data.time || 0) || "now",
        level: this.#levelFormatter(data.level || 'info'),
        id: nid
      })
      this.#initiator(nid)
      this.#_history.push(hist)
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

  /**
   * Set initiator
   * @param {initiator} init
   */
  setInitiator(init) {
    this.#initiator = init
  }

  get history() {
    return this.#_history
  }
}

export { Notification }

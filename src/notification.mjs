import { config } from "./config.mjs";

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
const Notification = (() => {
    const history = []
    let template = null;
    return {
        /**
        * Push Notification and renders it
        * @method
        * @param {NotificationData} data notification data
        */
        push(data) {
            history.push(data)
            console.log(`${data.title}\n${data.body}`)
        },

        setTemplate(tmpl) {
            template = tmpl
        }
    }
})()

export { Notification }

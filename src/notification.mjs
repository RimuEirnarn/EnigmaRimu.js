/**
 * Notification
 */
const Notification = (() => {
    const history = []
    return {
        /**
        * Push Notification and renders it
        * @param {Object} data notification data
        */
        push(data) {
            history.push(data)
        }
    }
})()

export { Notification }

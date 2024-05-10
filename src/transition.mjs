import { notify } from "./notification.mjs"
import { config } from "./config.mjs"

function _ProcessData(targetDOM, content) {
    targetDOM.html(content)
    let virtualTitle = $(config.target.app_title)
    let title = virtualTitle.text() || document.title
    document.title = title
    virtualTitle.remove()
    return title
}

/**
 * Process Ajax Data
 * @param {Object} response 
 * @param {String} urlPath 
 */
function processAjaxData(response, urlPath){
    let target = $(config.target.app)
    let content = target.get(0)
    if ((content.tagName !== "DIV") && (content.tagName !== "MAIN")) throw new Error("Content wrapper is not a div or main")
    
    let title = _ProcessData(target, response)
    let currentHistory = window.history.state || {'url': "/"}
    if ((currentHistory.url == urlPath) && window.history.length >= 2) {
        window.history.replaceState({'html': response, 'pageTitle': title, "url": urlPath}, "", urlPath)
        return
    }
    window.history.pushState({"html": response, "pageTitle": title, "url": urlPath},"", urlPath)
}

window.onpopstate = function(e){
    if(e.state){
        _ProcessData(config.target.app, e.state.html)
    }
};

function constructURL() {
    return `${window.location.pathname}`
}

export { transitionTo, transitionRoot }

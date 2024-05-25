import { config } from "./config.mjs"

/**
 * Process HTML data into DOM
 * @param {JQuery} targetDOM 
 * @param {String} content 
 * @returns {String} Page title
 */
function _ProcessData(targetDOM, content) {
    targetDOM.html(content)
    let virtualTitle = $(`${config.target.app} > title`)
    let title = document.title
    if (virtualTitle) {
        document.title = virtualTitle.text() || title
        virtualTitle.remove()
    }
    return title
}

/**
 * transition
 * @param {Object} data 
 * @param {String} urlPath 
 */
function transition(urlPath, data){
    let target = $(config.target.app || '#app')
    let content = target.get(0)
    if ((content.tagName !== "DIV") && (content.tagName !== "MAIN")) throw new Error("Content wrapper is not a div or main")
    
    let title = _ProcessData(target, data)
    let currentHistory = window.history.state || {'url': "/"}
    if ((currentHistory.url == urlPath) && window.history.length >= 2) {
        window.history.replaceState({'html': data, 'pageTitle': title, "url": urlPath}, "", urlPath)
        return
    }
    window.history.pushState({"html": data, "pageTitle": title, "url": urlPath},"", urlPath)
}

window.onpopstate = function(e){
    if(e.state){
        _ProcessData(config.target.app, e.state.html)
    }
};

export { transition }

// @ts-check
import { config } from "./config.mjs";

// @ts-ignore
if (typeof window.$ === "undefined")
  throw new Error(
    "transition.js requires jQuery to function properly as it needs to manipulates unrendered html code."
  );

/** @type {JQuery} */
// @ts-ignore
const $ = window.$

/**
 * Process HTML data into DOM
 * @param {jQuery | string} targetDOM
 * @param {String} content
 * @returns {String} Page title
 */
function _ProcessData(targetDOM, content) {
  if (targetDOM instanceof String) {
    /** @type {jQuery} */
    // @ts-ignore
    targetDOM = $(targetDOM)
  }
  // @ts-ignore
  targetDOM.html(content);
  // @ts-ignore
  let virtualTitle = $(`${config.target.app} > title`);
  let title = document.title;
  if (virtualTitle) {
    document.title = virtualTitle.text() || title;
    virtualTitle.remove();
  }
  return title;
}

/**
 * Performs a page transition by manipulating the DOM and updating the browser history.
 *
 * @param {string} urlPath - The URL path to navigate to.
 * @param {string} data - The HTML content to be displayed on the target page.
 *
 * @throws {Error} Throws an error if the content wrapper is not a div or main.
 *
 * @returns {void}
 */
function transition(urlPath, data) {
  // @ts-ignore
  let target = $(config.target.app || "#app");
  let finalUrl = config.transition_uses_hash ? `#${urlPath}` : urlPath;
  let content = target.get(0);
  if (content.tagName !== "DIV" && content.tagName !== "MAIN")
    throw new Error("Content wrapper is not a div or main");

  let title = _ProcessData(target, data);
  let currentHistory = window.history.state || { url: "/" };
  if (currentHistory.url == urlPath && window.history.length >= 2) {
    window.history.replaceState(
      { html: data, pageTitle: title, url: finalUrl },
      "",
      finalUrl
    );
    return;
  }
  window.history.pushState(
    { html: data, pageTitle: title, url: finalUrl },
    "",
    finalUrl
  );
}

window.onpopstate = function (e) {
  if (e.state) {
    _ProcessData(config.target.app || "#app", e.state.html);
  }
};

export { transition };

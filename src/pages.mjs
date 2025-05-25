// @ts-check
import { config } from "./config.mjs";
import { transition } from "./transition.mjs";
import { render_template } from "./utils.mjs";
import { DownloadManager, prepare } from "./downloader.mjs";
import { Template } from "./template.mjs";


var initialized = false;
/** @type {DownloadManager<Page>} */
const page_dm = new DownloadManager(true);
/**
 * Page data without URLs
 * @type {Object.<string, PageConfig>}
 */
const page_data = {};

/**
 * @typedef PageConfig
 * @type {Object}
 * @property {String?} [url] - Page URL
 * @property {String?} [data] - HTML data of the page if URL is not provided.
 * @property {function(): Object.<string, string> | Promise<Object.<string, string>>?} [init] - This function will be called when the page is initialized and is expected to return an object as template data.
 * @property {Function?} [post_init] - This function will be called after the page is initialized..
 */

/** @type {Object.<string, PageConfig>} */
const PAGE_FUNCTIONS = {};

/**
 * Page
 * @param {String} path Page URL path
 * @param {String} data HTML data of the page
 */
class Page {
  /** @type {string} */
  #path
  /** @type {string} */
  #data

  /**
   * Page
   * @param {String} path Page URL path
   * @param {String} data HTML data of the page
   */
  constructor(path, data) {
    this.#path = path
    this.#data = data
  }

  /**
   * Renders page (after renders the template by the data)
   * @param {Object.<string, string>} template_data
   * @returns {void}
   */
  render(template_data) {
    transition(this.#path, render_template(this.#data, template_data));
  }
};

/**
 * Setup Pages
 * @param {Object.<string, PageConfig>} page_route - All page routes
 */
function setup(page_route) {
  initialized = true;
  var queues = [];
  for (const path in page_route) {
    if (page_route.hasOwnProperty(path)) {
      const { url, data, init, post_init } = page_route[path];
      const name = path.replaceAll("/", "_");
      PAGE_FUNCTIONS[path] = {
        init: init,
        post_init: post_init,
      };
      if (url) {
        queues.push(prepare(name, url, {}, false, { path }));
        continue;
      }
      if (data) {
        page_data[path] = { url: null, data: data, init, post_init };
        continue;
      }
    }
  }
  page_dm.setQueue(queues);
  page_dm.execute((resp, obj) => {
    if (!["null", "undefined"].includes(typeof obj.misc))
      // @ts-ignore
      return new Page(obj.misc.path, resp);
    throw new ReferenceError(
      "Expecting additional data, but obj.misc is undefined"
    );
  });
}

function _process_inside_links(target) {
  const targetDOM = document.querySelector(target)
  if (!targetDOM) return;
  let links = targetDOM.querySelectorAll("a[href]");

  for (let i of links) {
    if (!(i in PAGE_FUNCTIONS)) continue;
    i.addEventListener("click", (e) => {
      e.preventDefault();
      let href = i.getAttribute("href");
      goto(href);
    });
  }
}

function post_setup(default_target) {
  let target = default_target || config.target.app || "#app";
  _process_inside_links(target);
}

/**
 * goto() URL
 * @param {String} path - URL path
 * @param {Function?} [oncomplete] - Oncomplete callback function
 */
async function goto(path, oncomplete = null) {
  /** @param {PageConfig} func  */
  async function post_processing(func) {
    _process_inside_links(config.target.app);

    document.dispatchEvent(
      new CustomEvent("page.transitioned", { detail: path })
    );
    if (oncomplete) oncomplete();
    if (func.post_init) func.post_init.constructor.name == "AsyncFunction" ? await func.post_init() : func.post_init() ;
  }

  const name = path.replaceAll("/", "_");
  if (!page_data[path]) {
    /** @type {Awaited<Page>} */
    // @ts-ignore
    const elem = await page_dm.data[name].promise;
    elem;
    let func = PAGE_FUNCTIONS[path];
    /** @type {Object.<string, string>} */
    // @ts-ignore
    let template_data = func.init
      ? func.init.constructor.name == "AsyncFunction"
        ? await func.init()
        : func.init()
      : {};
    elem.render(template_data || {});

    post_processing(func);
    return;
  }
  const elem = page_data[path];
  let func = PAGE_FUNCTIONS[path];
  let template_data = func.init
    ? func.init.constructor.name == "AsyncFunction"
      ? await func.init()
      : func.init()
    : {};
  // @ts-ignore
  new Page(path, elem.data).render(template_data || {});
  await post_processing(func);
}

export { setup, post_setup, goto, page_dm };

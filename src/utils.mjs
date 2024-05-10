
/**
 * Sanitize a string
 * @param {string} str data
 */
function sanitize(str) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    if (str === undefined || str === null)
        return 'null'
    if (typeof str === 'string')
        return str.replace(reg, (match) => (map[match]));
    else
        return str.toString().replace(reg, (match) => (map[match]));
}


/**
 * Generate randint
 * @param {integer} max maximum randint value
 */
function randint(max) {
    return Math.floor(Math.random() * max);
}


async function _sleep(time) {
    await new Promise(resolve => setTimeout(resolve, time * 1000))
}

/**
 * sleep
 * @param time time as second
 */
function sleep(time, callback) {
    _sleep(time).then(callback !== undefined ? callback : () => null)
}

/**
 * Get the value of a cookie
 * Source: https://gist.github.com/wpsmith/6cf23551dd140fb72ae7
 * @param  {String} name  The name of the cookie
 * @return {String}       The cookie value
 */
function getCookie(name) {
    let value = '; ' + document.cookie;
    let parts = value.split(`; ${name}=`);
    if (parts.length == 2) return decodeURIComponent(parts.pop().split(';').shift());
}

/**
 * Set the value of a cookie
 * @param  {String} name  The name of the cookie
 * @return {String}       The cookie value
 */
function setCookie(name, value) {
    const settings = {
        SameSite: 'strict',
        "max-age": 3600 * 24 * 365, // a whole year.
        path: "/"

    }
    var value = `${name}=${encodeURIComponent(value)}`
    for (let key in settings) {
        // F**k, init.
        value += `; ${key}=${settings[key]}`
    }
    document.cookie = value;
}

/**
 * See if window is small screen or not
 */
function isSmallScreen() {
    return window.matchMedia("(max-width: 767px)").matches
}

/**
 * Get current window's color scheme
 */
function getModeScheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/**
 * Returns current milisecond.
 */
function now() {
    return new Date().getTime()
}

/**
 * Trace queries; literally just mapped URL query into a mapping.
 */
function trace_query() {
    let q = location.search
    if (!q) return {}
    q = q.slice(1).split("&")
    const data = {}
    let key, val;

    for (let i of q)  {
        [key, val] = i.split('=')
        data[key] = val
    }
    return data
}

const id_ID = {
    identifier: 'id-ID',
    days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    shortDays: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    months: ["Januari", "Februari", "Maret", "April", "Mei", 'Juni', "Juli", "Agustus", "September", "Oktober","November","Desember"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    AM: 'AM',
    PM: 'PM',
    am: 'am',
    pm: 'pm',
    formats: {
        D: '%d/%m/%y',
        F: '%Y-%m-%d',
        R: '%H:%M',
        X: '%T',
        c: '%a %b %d %X %Y',
        r: '%I:%M:%S',
        T: '%H:%M:%S',
        v: '%e-%b-%Y',
        x: '%D'
    }
}
if (navigator.language.startsWith('id'))
    strftime.localize(id_ID)

export { sanitize, getCookie, setCookie, sleep, randint, isSmallScreen, now, getModeScheme, trace_query }

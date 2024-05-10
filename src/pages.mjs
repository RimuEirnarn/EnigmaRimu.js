import { config } from "./config.mjs";
import {  } from "./transition.mjs"

const Page = (data) => {
    const virtualDOM = config.target.app
    return {
        render() {
            document.getElementById(virtualDOM).innerHTML = data
        }
    }
}

export { Page }

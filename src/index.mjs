import { Notification } from "./notification.mjs";
import { setup, goto, Page } from "./pages.mjs";
import { config } from "./config.mjs";
import { Template } from "./template.mjs"
import { DownloadManager } from "./downloader.mjs"
import { randint } from "./utils.mjs"

function main() {
    new Notification()
    new Page()
    new Template(a)
    new DownloadManager()
    randint()
    config.transition_uses_hash.toString()
    setup()
    goto()
}

export { main }

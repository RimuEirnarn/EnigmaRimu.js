/** @typedef {import('./types.mjs').Action} Action */

class ActionRepository {
    /** @type {Object<string, Action>} */
    #repo;
    constructor() {
        this.#repo = {}
        return new Proxy(this, { // Return a Proxy to intercept property access
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop]; // Allow access to class methods
                }
                return target.#repo[prop]; // Access internal repository actions
            },
            set: (target, prop, value) => {
                if (typeof value === 'function') { // Ensure the value is a function
                    target.#repo[prop] = value;
                    return true;
                }
                throw new Error("Only functions can be added as actions.");
            },
            deleteProperty: (target, prop) => {
                if (prop in target) {
                    return;
                }
                delete this.#repo[prop];
            }
        });
    }

//     /**
//      * Push and set a callback action
//      * @param {string} name Action name
//      * @param {Action} action Action callback
//      */
//     push(name, action) {
//         if (typeof action !== 'function')
//             throw new Error("Action must be a function")
//         this.#repo[name] = action
//     }
}

const globalRepository = new ActionRepository()

function bound_buttons(base = document, action = globalRepository) {
  if (base === null) {
    throw new ValueError("Base element must be defined. You probably forgot that the value used is not found.")
  }
  const buttons = base.querySelectorAll("[data-action]");
  buttons.forEach((button) => {
    const [action_name, arg] = (button.getAttribute("data-action") || '').split(":");
    const action_prevention = JSON.parse(button.getAttribute('data-action-prevent') || 'true')
    // console.debug(`Action default prevention? ${action_prevention}`)

    if (action[action_name]) {
      button.addEventListener("click", async (event) => {
        if (action_prevention)
          event.preventDefault();
        await action[action_name](arg);
      });
    } else {
      console.warn(`No action found for "${action_name}"`);
    }
  });
  setLog("Bound all tracable actions.");
}

export { bound_buttons, globalRepository, ActionRepository }
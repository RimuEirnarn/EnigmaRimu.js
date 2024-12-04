/**
 * Bind forms to form element
 * @param {Object.<string, string>} data 
 * @param {Document | HTMLElement} base 
 * @param {boolean} require
 */
function bindForm(data, base = document, require = false) {
  base.querySelectorAll("[data-bind]").forEach((element) => {
    const bindPath = (element.getAttribute("data-bind") || "").split("/");
    let value = data;

    if ((require) && (!element.hasAttribute('data-unrequire'))) {
      // console.log(element, 'bindform')
      // @ts-ignore
      element.setAttribute('required', true)
    }

    // Traverse the object based on the bindPath array
    for (const key of bindPath) {
      if (value[key] === undefined) return; // Exit if path does not exist
      // @ts-ignore
      value = value[key];
    }

    // Set value or checked state based on element type
    // @ts-ignore
    if (element.type === "checkbox") {
      // @ts-ignore
      element.checked = Boolean(value);
      // @ts-ignore
    } else if (element.type === "number") {
      // @ts-ignore
      element.value = Number(value);
    } else {
      // @ts-ignore
      element.value = value;
    }
  });
}

export { bindForm }
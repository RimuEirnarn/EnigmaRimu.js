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

/** Function to gather data from the form into an object
 * @param {Document | HTMLElement} [base=document]
 * @param {Object?} [base]
 */
function collectFormData(base = document, forms = undefined) {
  const formData = forms !== undefined ? forms : {}

  base.querySelectorAll("[data-bind]").forEach((element) => {
    const bindPath = (element.getAttribute("data-bind") || '').split("/");
    let current = formData;

    // Traverse the object and create nested structure as needed
    for (let i = 0; i < bindPath.length; i++) {
      const key = bindPath[i];
      if (i === bindPath.length - 1) {
        // Determine the correct value type based on input type
        let value;
        // @ts-ignore
        switch (element.type) {
          case "checkbox":
            // @ts-ignore
            value = element.checked;
            break;
          case "number":
            // @ts-ignore
            value = element.value !== '' ? parseFloat(element.value) : null;
            break;
          case "date":
            // @ts-ignore
            value = element.value ? new Date(element.value).toISOString() : null;
            break;
          case "radio":
            // @ts-ignore
            if (element.checked) {
              // @ts-ignore
              value = element.value;
            }
            break;
          case "select-multiple":
            // @ts-ignore
            value = Array.from(element.selectedOptions).map(opt => opt.value);
            break;
          case "json": // Custom type for textarea/json fields
            try {
              // @ts-ignore
              value = JSON.parse(element.value);
            } catch {
              value = null;
            }
            break;
          default: // For text and other types
            // @ts-ignore
            value = element.value;
        }
        current[key] = value;
      } else {
        // Create nested objects if they don't exist
        current[key] = current[key] || {};
        current = current[key];
      }
    }
  });

  // @ts-ignore
  return formData;
}

export { bindForm, collectFormData }
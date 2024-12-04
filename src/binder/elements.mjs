import { ValueError } from "../errors.mjs";

const RULESET = {
  // flags: set, ignore, delete
  // Ruleset applies to data-init-*
  // Each value is 2-sized array, (if true, if false)
  require: ['set', 'ignore'],
  visibility: ['ignore', 'set']
}
const DEFAULT_RULESET = ['set', 'ignore']

function ruleset_set(element, name, value) {
  element.setAttribute(name, value)
}

function ruleset_delete(element, name) {
  element.removeAttribute(name)
}

function ruleset_if_string(element, name, value, index, ruleset) {
  const rules = ruleset ? ruleset : DEFAULT_RULESET
  if (rules[index] === 'set')
    ruleset_set(element, name, value);
  else if (rules[index] === 'delete')
    ruleset_delete(element, name)
}

function ruleset_case(element, name, value, index, ruleset) {
  const rules = ruleset ? ruleset : DEFAULT_RULESET
  const ruleset_type = typeof rules[index]
  if (ruleset_type === 'string')
    ruleset_if_string(element, name, value, index, rules)
  else if (ruleset_type === 'function')
    rules[index](element, name, value)
}


function apply_ruleset(element, name, real, value, condition, ruleset) {
  if (condition && ruleset[real] !== undefined) {
    ruleset_case(element, name, value, 0, ruleset[real])
  }
  if (!condition && ruleset[name] === undefined) {
    ruleset_case(element, name, value, 1)
  }

  if (condition) {
    ruleset_if_string(element, name, value, 0, DEFAULT_RULESET)
    return
  }
  ruleset_if_string(element, name, value, 1, DEFAULT_RULESET)
}

function inherit(element, attr_value) {
  const [targetId, targetAttr] = attr_value.split('?')[1].split('/');
  const targetElement = document.querySelector(`[data-id="${targetId}"]`);
  const targetValue = targetElement ? targetElement.getAttribute(targetAttr.trim()) : null;

  return cast(targetValue)
}

// Helper function to evaluate conditions
function evaluateCondition(actual, expected, operator) {
  switch (operator) {
    case '==': return actual == expected;
    case '!=': return actual != expected;
    case '>': return actual > expected;
    case '<': return actual < expected;
    case '>=': return actual >= expected;
    case '<=': return actual <= expected;
    default: return false;
  }
}

/**
 * 
 * @param {String} value 
 * @returns 
 */
function cast(value) {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

// Helper to dynamically get target element if not `this`
function getTargetElement(condition) {
  const match = condition.match(/[A-Za-z0-9_-]+\//);  // Extract target id
  const targetId = match ? (match[0].at(-1) == '/' ? match[0].slice(0, -1) : match[0]) : null;
  // console.log(`[data-id="${targetId}"]`, match, condition)
  return targetId ? document.querySelector(`[data-id="${targetId}"]`) : null;
}

// COMPUTE
function evaluateAttributeCondition(element, condition) {
  const [targetPath, operator, expectedValue] = condition.match(/([\w-\/]+)(==|!=|>=|<=|<|>)(.+)/).slice(1);
  const [_, targetAttr] = targetPath.split('/');
  const actualValue = element.getAttribute(targetAttr.trim());
  return evaluateCondition(actualValue, expectedValue.trim(), operator);
}

// Evaluate total children condition
function evaluateChildrenCondition(element, condition) {
  const [operator, expectedValue] = condition.match(/(==|!=|>=|<=|<|>)(\d+)/).slice(1);
  const childCount = element !== null ? element.children.length : 0;
  return evaluateCondition(childCount, parseInt(expectedValue), operator);
}

// Evaluate class count condition
function evaluateClassesCondition(element, condition) {
  const [operator, expectedValue] = condition.match(/(==|!=|>=|<=|<|>)(\d+)/).slice(1);
  const classCount = element.classList.length;
  return evaluateCondition(classCount, parseInt(expectedValue), operator);
}

function compute(element, attr_value) {
  const [operation, condition] = attr_value.split('?')[1].split(':');
  let result = false;
  if (condition === undefined) {
    throw new ValueError("Compute action does not exists due to syntax error. 'compute?action:condition' is the correct template.")
  }
  const target = (condition?.includes('this')) ? element : getTargetElement(condition);

  if (operation === 'attribute') {
    // Handle attribute-based comparisons
    result = evaluateAttributeCondition(target, condition);
  } else if (operation === 'total-children') {
    // Handle counting children of a target element
    result = evaluateChildrenCondition(target, condition);
  } else if (operation === 'classes') {
    // Handle class count on the current element (`this`)
    result = evaluateClassesCondition(target, condition)
  }
  return result
}

function parse_fetcher(element, value) {
  const action_name = value.split('?')[0]
  if (action_name === 'compute')
    return compute(element, value);
  if (action_name === "inherit")
    return inherit(element, value)
}

/**
 * 
 * @param {Element | Document} base 
 * @param {Object.<string, string>} mapper 
 */
function initialise(base = document, mapper, ruleset = RULESET) {
  // console.log(ruleset)
  base.querySelectorAll('[data-init]').forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      if (!attr.name.startsWith('data-init-'))
        return;

      const attrName = attr.name.replace('data-init-', '');
      const attrValue = attr.value;
      // console.log(element)
      const value = parse_fetcher(element, attrValue)

      const state = Boolean(value);
      console.debug(`Setting ${attrName} (${mapper[attrName]}) with "${value}" RULESET applies (state? ${state}).`)
      apply_ruleset(element, mapper[attrName] ? mapper[attrName] : attrName, attrName, value, state, ruleset)
      // if (state) {
      //   if (ruleset[attrName][0] == 'set')
      //     console.log(this, true)
      //     element.setAttribute(mapper[attrName], value);
      //   /* if (ruleset[attrName][0] == 'ignore)
      //       ... what
      //   */
      //   if (ruleset[attrName][0] == 'delete')
      //     element.removeAttribute(mapper[attrName])
      // }
      // else if (!state) {
      //   if (ruleset[attrName][1] == 'set')
      //     console.log(this, false)
      //     element.setAttribute(mapper[attrName], value);
      //   /* if (ruleset[attrName][1] == 'ignore)
      //       ... what
      //   */
      //   if (ruleset[attrName][1] == 'delete')
      //     element.removeAttribute(mapper[attrName])
      // }
      // // element.setAttribute(mapper[attrName], value)
      element.removeAttribute(attr.name)
      if (element.hasAttribute('data-init'))
        element.removeAttribute("data-init")
    })
  })
}

export { initialise, inherit, compute }
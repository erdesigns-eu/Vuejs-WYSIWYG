/**
 * @function defaultOption
 * @param Object} option
 * @param {String} key
 * @param {any} defaultValue
 * @returns {any}
 * @description
 * Returns the default value if the key is not found in the object
 * @example
 * defaultOption({ a: 1 }, 'a', 2) // 1
 * defaultOption({ a: 1 }, 'b', 2) // 2
 * defaultOption({ a: 1 }, 'b') // undefined
 * defaultOption({ a: 1 }, 'b', undefined) // undefined
 * defaultOption({ a: 1 }, 'b', null) // null
 * defaultOption({ a: 1 }, 'b', false) // false
 * defaultOption({ a: 1 }, 'b', '') // ''
 */
const defaultOption = (options, key, defaultValue) => {
  return options && options[key] !== undefined ? options[key] : defaultValue;
}

/**
 * @function isString
 * @param {any} value
 * @returns {Boolean}
 * @description
 * Returns true if the value is a string or a String object.
 */
const isString = (value) => {
  return typeof value === 'string' || value instanceof String;
}

/**
 * @function isJSON
 * @param {any} value
 * @returns {Boolean}
 * @description
 * Returns true if the value is a JSON string.
 * @example
 * isJSON('{"a":1}') // true
 * isJSON('{"a":1') // false
 */
const isJSON = (value) => {
  if (isString(value)) {
    return false;
  }
  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * @function isObject
 * @param {any} value
 * @returns {Boolean}
 * @description
 * Returns true if the value is an object.
 * @example
 * isObject({ a: 1 }) // true
 * isObject('{"a":1}') // false
 */
const isObject = (value) => {
  return value && typeof value === 'object' && value.constructor === Object;
}

/**
 * @function uuid
 * @returns {String}
 * @description Returns a UUID v4 string.
 */
const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

module.exports = {
  defaultOption,
  isString,
  isJSON,
  isObject,
  uuid,
};
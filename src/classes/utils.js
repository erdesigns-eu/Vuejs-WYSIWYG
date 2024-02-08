/**
 * @function isString
 * @description This function returns true if the value is a string, otherwise it returns false.
 * @param {any} val - The value to check.
 * @returns {boolean}
 */
export const isString = (val) =>
  typeof val === "string" || val instanceof String;

/**
 * @function isJSON
 * @description This function returns true if the value is a JSON string, otherwise it returns false.
 * @param {any} val - The value to check.
 * @returns {boolean}
 */
export const isJSON = (val) => {
  if (isString(val) && (val.startsWith("{") || val.startsWith("["))) {
    try {
      JSON.parse(val);
      return true;
    } catch (_) {
      return false;
    }
  }
  return false;
};

/**
 * @function isObject
 * @description This function returns true if the value is an object, otherwise it returns false.
 * @param {any} val - The value to check.
 * @returns {boolean}
 */
export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

/**
 * Assign object to a new empty object
 * @param {Object} obj
 * @returns Object
 */
export const assignEmptyObject = (obj) => {
  return Object.assign(Object.create(null), obj);
};

/**
 * Get value from key (including dot notation)
 * @example getProperty("some.sub.value", {some: {sub: {value: "foo-bar"}}}) returns "foo-bar"
 * @param {String} key
 * @param {Object} obj
 * @returns *
 */
export const getProperty = (key, obj) => {
  return key.split(".").reduce((o, i) => o[i], obj);
};

/**
 * Placeholder for the ipcRenderer object, used for development purposes.
 * @type {object}
 */
export const ipcRendererPlaceholder = {
  send: () => {},
  on: () => {},
  off: () => {},
  sendSync: () => {},
  once: () => {},
};

/**
 * @function userCountryCode
 * @returns {String}
 * @description Returns the country code of the user.
 */
export const userCountryCode = () => {
  try {
    const userLocale = navigator.language || navigator.userLanguage;
    const countryCode = new Intl.DisplayNames([userLocale], { type: "region" }).of(
      userLocale
    );
    return countryCode.toUpperCase();
  } catch (_) {
    return "NL";
  }
};
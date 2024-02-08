/**
 * @function hasParent
 * @param {HTMLElement} element
 * @param {string} className
 * @returns {boolean}
 * @description Check if element has parent with class name
 */
export const hasParent = (element, className) => {
  let currentElement = element;
  while (currentElement !== null && currentElement.classList) {
    if (currentElement.classList.contains(className)) {
      return currentElement !== element;
    }
    currentElement = currentElement.parentNode;
  }
  return false;
};

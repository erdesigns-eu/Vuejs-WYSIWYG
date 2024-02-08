/**
 * Convert an event to an accelerator string
 * @param {KeyboardEvent} event
 * @returns {string}
 */
export const eventToAccelerator = (event) => {
  let accelerator = "";
  if (event.ctrlKey) {
    accelerator += "Ctrl+";
  }
  if (event.shiftKey) {
    accelerator += "Shift+";
  }
  if (event.altKey) {
    accelerator += "Alt+";
  }
  if (event.metaKey) {
    accelerator += "Meta+";
  }
  accelerator += event.key.toUpperCase();
  return accelerator;
};

/**
 * Find a menu item by its accelerator
 * @param {Array} menuItems
 * @param {string} accelerator
 * @returns {object}
 */
export const findMenuItemByAccelerator = (menuItems, accelerator) => {
  for (const menuItem of menuItems) {
    if (menuItem.accelerator === accelerator) {
      return menuItem;
    }

    if (menuItem.items && menuItem.items.length > 0) {
      const foundItem = findMenuItemByAccelerator(menuItem.items, accelerator);
      if (foundItem) {
        return foundItem;
      }
    }
  }

  return null;
};

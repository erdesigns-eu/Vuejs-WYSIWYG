// Set all menu items to closed
export const setMenuItemsClosed = (menuItems) => {
  if (!menuItems || !Array.isArray(menuItems)) {
    return;
  }
  menuItems.forEach((menuItem) => {
    if (menuItem.items) {
      setMenuItemsClosed(menuItem.items);
    }
    if (menuItem.open) {
      delete menuItem.open;
    }
  });
};

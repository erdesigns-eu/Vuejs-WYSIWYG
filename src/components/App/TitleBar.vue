<template>
  <div class="titlebar">
    <div class="titlebar-container">
      <div class="titlebar-drag-region"></div>
      <div class="titlebar-left">
        <a
          class="window-appicon"
          :style="{ backgroundImage: `url(${this.Electron.icon()})` }"
        ></a>
        <div class="menubar" role="menubar">
          <div
            v-for="(menu, menuIndex) in menu"
            :key="menuIndex"
            :class="{ open: openMenuIndex === menuIndex }"
            class="menubar-menu-button"
            role="menuitem"
            tabindex="-1"
            :aria-label="menu.label"
            @click="onMenuButtonClick(menuIndex)"
            @mouseover="onMenuButtonHover(menuIndex)"
          >
            <div class="menubar-menu-title" role="none" aria-hidden="true">
              {{ menu.label }}
            </div>
            <div
              class="menubar-menu-items-holder"
              role="presentation"
              v-if="openMenuIndex === menuIndex"
            >
              <menu-items
                :menu="menu.items"
                @menu-click="onMenuClick"
              ></menu-items>
            </div>
          </div>
        </div>
      </div>
      <div class="titlebar-center">
        <div class="window-title">{{ Electron.title }}</div>
      </div>
      <div class="titlebar-right">
        <div class="layout-controls-container">
          <ul class="actions-container" role="toolbar">
            <li
              v-for="(button, buttonIndex) in toolbarButtons"
              :key="buttonIndex"
              class="action-item"
              role="presentation"
            >
              <a
                class="action-label mdi"
                role="button"
                :aria-label="button.label"
                :class="[{ disabled: button.disabled }, button.icon]"
                @click="onToolbarButtonClick(buttonIndex, button)"
              ></a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MenuItems from "./MenuItems.vue";

import { toRaw } from "vue";
import { setMenuItemsClosed } from "@/utils/menu";
import {
  eventToAccelerator,
  findMenuItemByAccelerator,
} from "@/utils/accelerator";
import { hasParent } from "@/utils/event";

export default {
  name: "TitleBar",
  components: {
    MenuItems,
  },
  inject: {
    Electron: "electron",
  },
  props: {
    menu: {
      type: Array,
      required: true,
    },
    toolbarButtons: {
      type: Array,
      required: false,
      default: [],
    },
  },
  data() {
    return {
      openMenuIndex: -1,
    };
  },
  methods: {
    outsideMenuClick(event) {
      if (
        this.openMenuIndex !== -1 &&
        !event.target.closest(".menubar-menu-button") &&
        !hasParent(event.target, ".menubar-menu-button")
      ) {
        this.openMenuIndex = -1;
        setMenuItemsClosed(this.menu);
      }
    },
    onMenuButtonClick(menuIndex) {
      if (this.openMenuIndex === menuIndex) {
        this.openMenuIndex = -1;
      } else {
        this.openMenuIndex = menuIndex;
      }
    },
    onMenuButtonHover(menuIndex) {
      if (menuIndex !== this.openMenuIndex) {
        setMenuItemsClosed(this.menu);
      }
      if (this.openMenuIndex !== -1) {
        this.openMenuIndex = menuIndex;
      }
    },
    onMenuClick(menuItem, menuIndex, closeMenu) {
      if (closeMenu) {
        this.openMenuIndex = -1;
        setMenuItemsClosed(this.menu);
      }
      this.Electron.sendToMain("menu-item-click", toRaw(menuItem));
    },
    onToolbarButtonClick(buttonIndex, button) {
      if (!button.disabled) {
        this.Electron.sendToMain("toolbar-button-click", toRaw(button));
      }
    },
    handleHotkey(event) {
      if (event.key === "Escape") {
        this.handleEscapeKey();
      } else {
        this.handleAccelerator(event);
      }
    },
    handleEscapeKey() {
      // Close menu if open
      if (this.openMenuIndex !== -1) {
        setMenuItemsClosed(this.menu);
        this.openMenuIndex = -1;
      }
    },
    handleAccelerator(event) {
      // Convert event to accelerator
      const accelerator = eventToAccelerator(event);
      // Find menu item by accelerator
      const menuItem = findMenuItemByAccelerator(this.menu, accelerator);
      // If menu item found, send to main process
      if (menuItem) {
        // Prevent default
        event.preventDefault();
        // Prevent bubbling
        event.stopPropagation();
        // Close menu if not a checkbox or radio
        const closeMenu =
          menuItem.type !== "checkbox" && menuItem.type !== "radio";
        if (closeMenu) {
          this.openMenuIndex = -1;
          setMenuItemsClosed(this.menu);
        }
        // Send to main process
        this.Electron.sendToMain("menu-item-click", toRaw(menuItem));
      }
    },
  },
  watch: {
    openMenuIndex() {
      if (this.openMenuIndex !== -1) {
        window.addEventListener("contextmenu", this.outsideMenuClick);
        window.addEventListener("click", this.outsideMenuClick);
      } else {
        window.removeEventListener("contextmenu", this.outsideMenuClick);
        window.removeEventListener("click", this.outsideMenuClick);
      }
    },
  },
  created() {
    // Add event listener for hotkeys
    window.addEventListener("keydown", this.handleHotkey);
    // Close menu when window loses focus
    this.Electron.addEventListener("blur", () => {
      if (this.openMenuIndex !== -1) {
        this.openMenuIndex = -1;
      }
    });
  },
  beforeDestroy() {
    // Remove event listener for hotkeys
    window.removeEventListener("keydown", this.handleHotkey);
    // Remove event listener for window blur
    this.Electron.removeEventListener("blur");
  },
};
</script>

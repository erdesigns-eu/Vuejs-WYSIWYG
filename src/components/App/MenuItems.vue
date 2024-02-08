<template>
  <ul class="menubar-menu-items-menu">
    <li
      v-for="(menuItem, menuIndex) in menu"
      :key="menuIndex"
      class="menubar-menu-item"
      role="menuitem"
      tabindex="-1"
    >
      <div
        class="menubar-menu-item-divider"
        v-if="menuItem.divider === true"
      ></div>
      <a
        v-else
        class="menubar-menu-item-content"
        role="button"
        :aria-label="menuItem.label"
        :class="{ disabled: menuItem.disabled, open: menuItem.open }"
        @click.stop="onMenuItemClick(menuItem, menuIndex)"
        @contextmenu.prevent="onMenuItemClick(menuItem, menuIndex)"
        @mouseenter="onMenuItemMouseEnter(menuItem)"
      >
        <div class="menubar-menu-item-start">
          <div
            class="menubar-menu-item-check-radio mdi"
            :class="{
              'mdi-check':
                (menuItem.checked && menuItem.type === 'checkbox') ||
                menuItem.type === 'radio',
            }"
          ></div>
          <div class="menubar-menu-item-label">{{ menuItem.label }}</div>
        </div>
        <div class="menubar-menu-item-end">
          <div class="menubar-menu-item-accelerator">
            {{ menuItem.accelerator }}
          </div>
          <div
            class="menubar-menu-item-expand mdi"
            :class="{
              'mdi-chevron-right': menuItem.items && menuItem.items.length,
            }"
          ></div>
          <div
            class="menubar-submenu-items-holder"
            :class="{ open: menuItem.open }"
            v-if="menuItem.items && menuItem.items.length && menuItem.open"
          >
            <menu-items
              :parent-menu="menuItem"
              :menu="menuItem.items"
              @menu-click="onSubMenuItemClick"
            ></menu-items>
          </div>
        </div>
      </a>
    </li>
  </ul>
</template>

<script>
import { setMenuItemsClosed } from "@/utils/menu";

export default {
  name: "MenuItems",
  emits: ["menu-click"],
  props: {
    menu: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      openMenuItem: null,
    };
  },
  methods: {
    onMenuItemClick(menuItem, menuIndex) {
      if (!menuItem.disabled) {
        let closeMenu = true;
        if (menuItem.type === "checkbox") {
          menuItem.checked = !menuItem.checked;
          closeMenu = false;
        }
        if (menuItem.items && menuItem.items.length) {
          closeMenu = false;
        }
        this.$emit("menu-click", menuItem, menuIndex, closeMenu);
      }
    },
    onSubMenuItemClick(menuItem, menuIndex, closeMenu) {
      this.$emit("menu-click", menuItem, menuIndex, closeMenu);
    },
    onMenuItemMouseEnter(menuItem) {
      if (this.openMenuItem && this.openMenuItem !== menuItem) {
        setMenuItemsClosed(this.menu);
        this.openMenuItem.open = false;
        this.openMenuItem = null;
      }
      if (menuItem.items && menuItem.items.length) {
        this.openMenuItem = menuItem;
        menuItem.open = true;
      }
    },
  },
};
</script>

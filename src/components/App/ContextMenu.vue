<template>
  <div
    class="context-menu"
    v-show="visible"
    :style="contextStyle"
    tabindex="-1"
  >
    <menu-items :menu="menu" @menu-click="onMenuClick"></menu-items>
  </div>
</template>

<script>
import MenuItems from "./MenuItems.vue";

import { setMenuItemsClosed } from "@/utils/menu";
import { hasParent } from "@/utils/event";
import { toRaw } from "vue";

export default {
  name: "ContextMenu",
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
  },
  data() {
    return {
      visible: false,
      top: 0,
      left: 0,
    };
  },
  computed: {
    contextStyle() {
      return {
        top: `${this.top}px`,
        left: `${this.left}px`,
      };
    },
  },
  methods: {
    setPositionFromEvent(e) {
      e = e || window.event;
      const scrollingElement =
        document.scrollingElement || document.documentElement;
      if (e.pageX || e.pageY) {
        this.left = e.pageX;
        this.top = e.pageY - scrollingElement.scrollTop;
      } else if (e.clientX || e.clientY) {
        this.left = e.clientX + scrollingElement.scrollLeft;
        this.top = e.clientY + scrollingElement.scrollTop;
      }
      this.$nextTick(() => {
        const menu = this.$el;
        const minHeight =
          (menu.style.minHeight || menu.style.height).replace("px", "") || 32;
        const minWidth =
          (menu.style.minWidth || menu.style.width).replace("px", "") || 32;
        const scrollHeight = menu.scrollHeight || minHeight;
        const scrollWidth = menu.scrollWidth || minWidth;
        const largestHeight = window.innerHeight - scrollHeight;
        const largestWidth = window.innerWidth - scrollWidth;
        if (this.top > largestHeight) this.top = largestHeight;
        if (this.left > largestWidth) this.left = largestWidth;
      });
      return e;
    },
    open(e) {
      this.setPositionFromEvent(e);
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    outsideMenuClick(event) {
      if (
        this.visible &&
        !event.target.closest(".context-menu") &&
        !hasParent(event.target, ".context-menu")
      ) {
        setMenuItemsClosed(this.menu);
        this.close();
      }
    },
    onMenuClick(menuItem, menuIndex, closeMenu) {
      if (closeMenu) {
        this.close();
      }
      this.Electron.sendToMain("menu-item-click", toRaw(menuItem));
    },
  },
  watch: {
    visible() {
      if (this.visible) {
        window.addEventListener("mousedown", this.outsideMenuClick);
      } else {
        window.removeEventListener("mousedown", this.outsideMenuClick);
      }
    },
  },
};
</script>

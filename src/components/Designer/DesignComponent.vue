<template>
  <div
    class="design-component"
    ref="design-component"
    :class="{ selected: selected, dragging: dragging, resizing: resizing }"
    :style="style"
    @click="onClick"
    @mousedown="onMousedown"
    @mouseup="onMouseup"
  >
    <!-- Selection Frame -->
    <div class="design-component-selection-frame"></div>
    <div class="design-component-selection-frame-handle-top"></div>
    <div class="design-component-selection-frame-handle-right"></div>
    <div class="design-component-selection-frame-handle-bottom"></div>
    <div class="design-component-selection-frame-handle-left"></div>
    <!-- End Selection Frame -->

    <!-- Resize Handles - TOP -->
    <div class="design-component-resize-handle handle-nw"></div>
    <div class="design-component-resize-handle handle-nc"></div>
    <div class="design-component-resize-handle handle-ne"></div>
    <!-- End Resize Handles - TOP -->

    <!-- Resize Handles - MIDDLE -->
    <div class="design-component-resize-handle handle-mw"></div>
    <div class="design-component-resize-handle handle-me"></div>
    <!-- End Resize Handles - MIDDLE -->

    <!-- Resize Handles - BOTTOM -->
    <div class="design-component-resize-handle handle-sw"></div>
    <div class="design-component-resize-handle handle-sc"></div>
    <div class="design-component-resize-handle handle-se"></div>
    <!-- End Resize Handles - BOTTOM -->
  </div>
</template>

<script>
export default {
  name: "DesignComponent",
  emits: [
    "update:width",
    "update:height",
    "update:x",
    "update:y",
    "update:selected",
    "update:dragging",
    "update:resizing",
    "select",
    "dragStart",
  ],
  props: {
    id: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    selected: {
      type: Boolean,
      required: true,
    },
    dragging: {
      type: Boolean,
      required: true,
    },
    resizing: {
      type: Boolean,
      required: true,
    },
  },
  inject: ["zoom", "gridSize", "snapToGrid"],
  computed: {
    style() {
      return {
        width: `${this.designWidth}px`,
        height: `${this.designHeight}px`,
        left: `${this.designX}px`,
        top: `${this.designY}px`,
      };
    },
    designWidth() {
      return this.width * (this.zoom() / 100);
    },
    designHeight() {
      return this.height * (this.zoom() / 100);
    },
    designX() {
      return this.x * (this.zoom() / 100);
    },
    designY() {
      return this.y * (this.zoom() / 100);
    },
  },
  methods: {
    onClick(e) {
      if (this.dragging || this.resizing) return;
      this.$emit("select", this.id, e);
    },
    onMousedown(e) {
      if (!this.selected) return;
      if (e.target === this.$refs["design-component"]) {
        this.$emit("dragStart", this.id, e);
      }
    },
    onMouseUp() {
      this.$emit("update:dragging", false);
      this.$emit("update:resizing", false);
    },
  },
  watch: {
    selected(val) {
      if (!val) {
        this.$emit("update:dragging", false);
        this.$emit("update:resizing", false);
      }
    },
  },
};
</script>

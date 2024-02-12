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
    <!-- End Selection Frame -->

    <!-- Resize Handles - TOP -->
    <div
      class="design-component-resize-handle handle-nw"
      @mousedown="onHandlerMousedown('nw', $event)"
    ></div>
    <div
      class="design-component-resize-handle handle-nc"
      @mousedown="onHandlerMousedown('nc', $event)"
    ></div>
    <div
      class="design-component-resize-handle handle-ne"
      @mousedown="onHandlerMousedown('ne', $event)"
    ></div>
    <!-- End Resize Handles - TOP -->

    <!-- Resize Handles - MIDDLE -->
    <div
      class="design-component-resize-handle handle-mw"
      @mousedown="onHandlerMousedown('mw', $event)"
    ></div>
    <div
      class="design-component-resize-handle handle-me"
      @mousedown="onHandlerMousedown('me', $event)"
    ></div>
    <!-- End Resize Handles - MIDDLE -->

    <!-- Resize Handles - BOTTOM -->
    <div
      class="design-component-resize-handle handle-sw"
      @mousedown="onHandlerMousedown('sw', $event)"
    ></div>
    <div
      class="design-component-resize-handle handle-sc"
      @mousedown="onHandlerMousedown('sc', $event)"
    ></div>
    <div
      class="design-component-resize-handle handle-se"
      @mousedown="onHandlerMousedown('se', $event)"
    ></div>
    <!-- End Resize Handles - BOTTOM -->

    <!-- Label -->
    <div class="design-component-label">
      <div class="design-component-label-position">
        <span class="design-component-label-position-indicator">X</span>
        <span class="design-component-label-position-x">{{ x }}</span>
        <span class="design-component-label-position-indicator">Y</span>
        <span class="design-component-label-position-y">{{ y }}</span>
      </div>
      <div class="design-component-label-dimensions">
        <span class="design-component-label-position-indicator">W</span>
        <span class="design-component-label-position-x">{{ width }}</span>
        <span class="design-component-label-position-indicator">H</span>
        <span class="design-component-label-position-y">{{ height }}</span>
      </div>
    </div>
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
    "resizeStart",
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
    positionLabel() {
      return `X ${this.x}, Y ${this.y}`;
    },
    dimensionsLabel() {
      return `W ${this.width}, H ${this.height}`;
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
    onHandlerMousedown(handler, e) {
      if (!this.selected) return;
      if (
        e.target.classList.contains("design-component-resize-handle") ||
        e.target.classList.contains("frame-handle")
      ) {
        this.$emit("resizeStart", this.id, handler, e);
      }
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

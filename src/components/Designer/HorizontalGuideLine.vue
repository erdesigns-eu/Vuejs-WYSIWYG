<template>
  <div
    ref="guide"
    class="design-horizontal-guide"
    :class="{ active: active, 'label-always-visible': labelAlwaysVisible }"
    :style="style"
    @mousedown="onMouseDown"
  >
    <div class="design-horizontal-guide-indicator"></div>
    <div class="design-horizontal-guide-line" :style="lineStyle"></div>
    <div class="design-horizontal-guide-label">
      <div class="label-label" v-show="label.length">{{ label }}</div>
      <div class="label-position">{{ this.position }} px</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HorizontalGuideLine",
  emits: ["update:position"],
  props: {
    position: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: "",
    },
    labelAlwaysVisible: {
      type: Boolean,
      default: false,
    },
  },
  inject: ["zoom", "gridSize", "snapToGrid"],
  data() {
    return {
      active: false,
    };
  },
  computed: {
    style() {
      return {
        top: `${this.position * (this.zoom() / 100) - 3}px`,
      };
    },
    lineStyle() {
      return {
        backgroundColor: this.color,
      };
    },
  },
  methods: {
    onMouseDown() {
      this.active = true;
      window.addEventListener("mousemove", this.onMouseMove);
      window.addEventListener("mouseup", this.onMouseUp);
    },
    onMouseMove(event) {
      if (this.active && event.target.classList.contains("design-surface-overlay")) {
        const gridSize = this.gridSize();
        const y = event.offsetY;
        const position = (y - 3) * (100 / this.zoom());
        if (this.snapToGrid()) {
          const snapPosition = Math.round(position / gridSize) * gridSize;
          if (snapPosition > 0) {
            this.$emit("update:position", snapPosition);
          }
        } else {
          this.$emit("update:position", position);
        }
      }
    },
    onMouseUp() {
      this.active = false;
      window.removeEventListener("mousemove", this.onMouseMove);
      window.removeEventListener("mouseup", this.onMouseUp);
    },
  },
};
</script>

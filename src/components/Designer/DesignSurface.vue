<template>
  <div class="design-surface" ref="container" @wheel="onWheel">
    <!-- Rulers -->
    <canvas class="design-horizontal-ruler" ref="h-ruler" v-show="ruler"></canvas>
    <canvas class="design-vertical-ruler" ref="v-ruler" v-show="ruler"></canvas>
    <div class="design-ruler-corner" v-show="ruler">
      <a class="design-ruler-corner-button mdi mdi-cog"></a>
    </div>
    <!-- End Rulers -->

    <!-- Grid -->
    <canvas class="design-grid" ref="design-grid" v-show="grid"></canvas>
    <div class="design-surface-content" :style="designSurfaceStyle">
      <slot></slot>
    </div>
    <!-- End Grid -->

    <!-- Surface Overlay -->
    <div
      class="design-surface-overlay"
      ref="design-service-overlay"
      tabindex="0"
      @mousedown="onDesignSurfaceMouseDown"
      @mouseup="onDesignSurfaceMouseUp"
      @mousemove="onDesignSurfaceMouseMove"
      @keyup="onDesignSurfaceKeyUp"
    >
      <template v-if="guides">
        <!-- Horizontal Guides -->
        <horizontal-guide-line
          v-for="(guide, index) in horizontalGuides"
          :key="index"
          v-model:position="guide.position"
          :color="guide.color"
          :label="guide.label"
        ></horizontal-guide-line>
        <!-- End Horizontal Guides -->
        <!-- Vertical Guides -->
        <vertical-guide-line
          v-for="(guide, index) in verticalGuides"
          :key="index"
          v-model:position="guide.position"
          :color="guide.color"
          :label="guide.label"
        ></vertical-guide-line>
        <!-- End Vertical Guides -->
      </template>

      <design-component
        v-for="(component, index) in components"
        :key="index"
        :id="component.id"
        v-model:width="component.width"
        v-model:height="component.height"
        v-model:x="component.x"
        v-model:y="component.y"
        v-model:selected="component.selected"
        v-model:dragging="component.dragging"
        v-model:resizing="component.resizing"
        @select="onSelect"
        @drag-start="onDragStart"
        @resize-start="onResizeStart"
      ></design-component>
    </div>
    <!-- End Surface Overlay -->

    <!-- Minimap -->
    <canvas
      class="design-minimap"
      ref="design-minimap"
      :width="minimapWidth"
      :height="minimapHeight"
      v-show="minimap"
    ></canvas>
    <!-- End Minimap -->
  </div>
</template>

<script>
import horizontalGuideLine from "./HorizontalGuideLine.vue";
import verticalGuideLine from "./VerticalGuideLine.vue";

import DesignComponent from "./DesignComponent.vue";

export default {
  name: "DesignSurface",
  emits: ["update:zoom", "update:components"],
  components: {
    horizontalGuideLine,
    verticalGuideLine,
    DesignComponent,
  },
  props: {
    zoom: {
      type: Number,
      default: 100,
      validator: (value) => value > 50 && value < 1000,
    },
    grid: {
      type: Boolean,
      default: true,
    },
    snapToGrid: {
      type: Boolean,
      default: false,
    },
    gridType: {
      type: String,
      default: "dot",
      validator: (value) => {
        return ["dot", "dash", "line"].includes(value);
      },
    },
    gridColor: {
      type: String,
      default: "#f8fafd",
    },
    gridSize: {
      type: Number,
      validator: (value) => value >= 5 && value < 100,
      default: 8,
    },
    minimap: {
      type: Boolean,
      default: false,
    },
    minimapWidth: {
      type: Number,
      validator: (value) => value > 50 && value < 500,
      default: 150,
    },
    minimapHeight: {
      type: Number,
      validator: (value) => value > 50 && value < 500,
      default: 100,
    },
    ruler: {
      type: Boolean,
      default: true,
    },
    guides: {
      type: Boolean,
      default: true,
    },
    horizontalGuides: {
      type: Array,
      default: () => [],
    },
    verticalGuides: {
      type: Array,
      default: () => [],
    },
    components: {
      type: Array,
      default: () => [],
    },
  },
  provide() {
    return {
      zoom: () => this.reactiveZoom,
      gridSize: () => this.reactiveGridSize,
      snapToGrid: () => this.reactiveSnapToGrid,
    };
  },
  data() {
    return {
      reactiveZoom: this.zoom,
      reactiveGridSize: this.gridSize,
      reactiveSnapToGrid: this.snapToGrid,
      containerObserver: null,
    };
  },
  computed: {
    designSurfaceStyle() {
      return {
        transform: `scale(${this.zoom / 100})`,
      };
    },
  },
  methods: {
    initializeCanvas() {
      const container = this.$refs.container;
      const verticalRuler = this.$refs["v-ruler"];
      const horizontalRuler = this.$refs["h-ruler"];
      const canvas = this.$refs["design-grid"];
      if (container && verticalRuler && horizontalRuler && canvas) {
        canvas.width = container.offsetWidth - verticalRuler.offsetWidth;
        canvas.height = container.offsetHeight - horizontalRuler.offsetHeight;
        this.drawGrid(canvas);
      }
      this.drawHorizontalRuler();
      this.drawVerticalRuler();
    },
    drawGrid(canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      for (let x = 1; x <= canvas.width; x += (this.gridSize * this.zoom) / 100) {
        for (let y = 1; y <= canvas.height; y += (this.gridSize * this.zoom) / 100) {
          switch (this.gridType) {
            case "dot":
              ctx.fillStyle = this.gridColor;
              ctx.fillRect(x - 0.75, y - 0.75, 0.75, 0.75);
              break;
            case "line":
            default:
              ctx.lineWidth = 0.25;
              ctx.strokeStyle = this.gridColor;
              ctx.moveTo(x, 0);
              ctx.lineTo(x, canvas.height);
              ctx.moveTo(0, y);
              ctx.lineTo(canvas.width, y);
              break;
          }
        }
      }
      ctx.stroke();
    },
    drawHorizontalRuler() {
      const horizontalRuler = this.$refs["h-ruler"];
      const verticalRuler = this.$refs["v-ruler"];
      if (horizontalRuler) {
        const ctx = horizontalRuler.getContext("2d");
        const rulerWidth = horizontalRuler.offsetWidth;
        const rulerHeight = horizontalRuler.offsetHeight;

        horizontalRuler.width = rulerWidth;
        horizontalRuler.height = rulerHeight;

        ctx.clearRect(0, 0, rulerWidth, rulerHeight);
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.strokeStyle = this.gridColor;
        ctx.fillStyle = this.gridColor;
        ctx.font = "10px";

        const adjustedGridSize = this.gridSize * (this.zoom / 100);
        const minimumSpacing = 0.5;

        const minorTickSpacing = adjustedGridSize;
        const majorTickSpacing = adjustedGridSize * 10;
        const startOffset = verticalRuler.offsetWidth;

        if (minorTickSpacing >= minimumSpacing) {
          for (let i = 0; i < rulerWidth - startOffset; i += minorTickSpacing) {
            const isMajorTick = i % majorTickSpacing === 0;
            ctx.lineWidth = isMajorTick ? 0.5 : 0.5;

            const tickLength = isMajorTick ? rulerHeight : rulerHeight / 3;
            ctx.beginPath();
            ctx.moveTo(i + startOffset + 1 - ctx.lineWidth / 2, rulerHeight);
            ctx.lineTo(i + startOffset + 1 - ctx.lineWidth / 2, rulerHeight - tickLength);
            ctx.stroke();

            if (isMajorTick && majorTickSpacing >= minimumSpacing * 10) {
              const label = (i / adjustedGridSize) * this.gridSize;
              ctx.fillText(label.toString(), i + startOffset + 2, 0);
            }
          }
        }
      }
    },
    drawVerticalRuler() {
      const verticalRuler = this.$refs["v-ruler"];
      if (verticalRuler) {
        const ctx = verticalRuler.getContext("2d");
        const rulerWidth = verticalRuler.offsetWidth;
        const rulerHeight = verticalRuler.offsetHeight;

        verticalRuler.width = rulerWidth;
        verticalRuler.height = rulerHeight;

        ctx.clearRect(0, 0, rulerWidth, rulerHeight);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = this.gridColor;
        ctx.fillStyle = this.gridColor;
        ctx.font = "10px";

        const adjustedGridSize = this.gridSize * (this.zoom / 100);
        const minimumSpacing = 0.5;

        const minorTickSpacing = adjustedGridSize;
        const majorTickSpacing = adjustedGridSize * 10;

        if (minorTickSpacing >= minimumSpacing) {
          for (let i = 0; i < rulerHeight; i += minorTickSpacing) {
            const isMajorTick = i % majorTickSpacing === 0;
            ctx.lineWidth = isMajorTick ? 0.5 : 0.5;

            const tickLength = isMajorTick ? rulerWidth : rulerWidth / 3;
            ctx.beginPath();
            ctx.moveTo(rulerWidth, i + ctx.lineWidth / 2);
            ctx.lineTo(rulerWidth - tickLength, i + ctx.lineWidth / 2);
            ctx.stroke();

            if (isMajorTick && majorTickSpacing >= minimumSpacing * 10) {
              ctx.save();
              ctx.translate(rulerWidth - tickLength + 5, i + 3);
              ctx.rotate(-Math.PI / 2);
              const label = (i / adjustedGridSize) * this.gridSize;
              ctx.fillText(label.toString(), 0, 0);
              ctx.restore();
            }
          }
        }
      }
    },
    handleResize() {
      this.initializeCanvas();
    },
    onWheel(event) {
      if (event.ctrlKey) {
        event.preventDefault();
        const delta = Math.sign(event.deltaY);
        this.$emit(
          "update:zoom",
          Math.min(Math.max(this.reactiveZoom - delta * 25, 50), 1000)
        );
      }
    },
    onSelect(id, e) {
      const isShift = e.shiftKey;
      const isCtrl = e.ctrlKey;
      if (isShift) {
        this.$emit(
          "update:components",
          this.components.map((c) => ({
            ...c,
            selected: c.id === id ? !c.selected : c.selected,
          }))
        );
      } else if (isCtrl) {
        this.$emit(
          "update:components",
          this.components.map((c) => ({
            ...c,
            selected: c.id === id ? !c.selected : c.selected,
          }))
        );
      } else {
        this.$emit(
          "update:components",
          this.components.map((c) => ({ ...c, selected: c.id === id }))
        );
      }
    },
    onDragStart(id, e) {
      const draggedComponent = this.components.find((c) => c.id === id);
      if (draggedComponent) {
        const scaleFactor = this.zoom / 100;

        const adjustedOffsetX = e.offsetX / scaleFactor;
        const adjustedOffsetY = e.offsetY / scaleFactor;

        draggedComponent.draggingOffset = {
          x: adjustedOffsetX,
          y: adjustedOffsetY,
        };

        this.$emit(
          "update:components",
          this.components.map((c) => {
            if (c.selected) {
              const relativeOffset = {
                x: draggedComponent.x - c.x + adjustedOffsetX,
                y: draggedComponent.y - c.y + adjustedOffsetY,
              };
              return {
                ...c,
                dragging: c.id === id,
                resizing: false,
                draggingOffset:
                  c.id === id
                    ? { x: adjustedOffsetX, y: adjustedOffsetY }
                    : relativeOffset,
              };
            } else {
              return c;
            }
          })
        );
      }
    },
    onResizeStart(id, handler, e) {
      const resizedComponent = this.components.find((c) => c.id === id);
      if (resizedComponent) {
        this.$refs["design-service-overlay"].classList.add(`resize-${handler}`);
        const scaleFactor = this.zoom / 100;

        const adjustedOffsetX = e.offsetX / scaleFactor;
        const adjustedOffsetY = e.offsetY / scaleFactor;

        resizedComponent.resizingHandler = handler;
        resizedComponent.resizingOffset = {
          x: adjustedOffsetX,
          y: adjustedOffsetY,
        };

        this.$emit(
          "update:components",
          this.components.map((c) => {
            const relativeOffset = {
              x: resizedComponent.x - c.x + adjustedOffsetX,
              y: resizedComponent.y - c.y + adjustedOffsetY,
            };
            if (c.selected) {
              return {
                ...c,
                dragging: false,
                resizing: c.id === id,
                resizingHandler: handler,
                resizingOffset:
                  c.id === id
                    ? { x: adjustedOffsetX, y: adjustedOffsetY }
                    : relativeOffset,
              };
            } else {
              return c;
            }
          })
        );
      }
    },
    onDesignSurfaceMouseDown(e) {
      const designSurface = this.$refs["design-service-overlay"];
      if (designSurface === e.target) {
        // Clear selection if clicked outside of any component
        const selectedComponents = this.components.filter((c) => c.selected);
        if (selectedComponents.length > 0) {
          this.$emit(
            "update:components",
            this.components.map((c) => ({ ...c, selected: false }))
          );
        }
      }
    },
    onDesignSurfaceMouseUp() {
      // Clear dragging and resizing states
      this.$emit(
        "update:components",
        this.components.map((c) => {
          delete c.draggingOffset;
          delete c.resizingOffset;
          delete c.resizingHandler;
          return { ...c, dragging: false, resizing: false };
        })
      );
      // Remove resize class from overlay
      const designSurface = this.$refs["design-service-overlay"];
      const designSurfaceClasses = designSurface.classList;
      for (let i = 0; i < designSurfaceClasses.length; i++) {
        if (designSurfaceClasses[i].startsWith("resize-")) {
          designSurfaceClasses.remove(designSurfaceClasses[i]);
        }
      }
    },
    onDesignSurfaceMouseMove(e) {
      if (e.target !== this.$refs["design-service-overlay"]) return;
      if (e.buttons === 1) {
        // Drag selected components
        const draggingComponents = this.components.filter((c) => c.dragging);
        if (draggingComponents.length > 0) {
          this.$emit(
            "update:components",
            this.components.map((c) => {
              if (c.selected) {
                const offsetX = e.offsetX * (100 / this.zoom) - c.draggingOffset.x;
                const offsetY = e.offsetY * (100 / this.zoom) - c.draggingOffset.y;
                let x, y;
                if (this.snapToGrid) {
                  x = Math.round(offsetX / this.gridSize) * this.gridSize;
                  y = Math.round(offsetY / this.gridSize) * this.gridSize;
                } else {
                  x = offsetX;
                  y = offsetY;
                }
                if (x < 0) x = 0;
                if (y < 0) y = 0;
                return { ...c, x, y };
              }
              return c;
            })
          );
        }

        // Resize selected components
        const resizingComponents = this.components.filter((c) => c.resizing);
        if (resizingComponents.length > 0) {
          const handler = resizingComponents[0].resizingHandler;
          switch (handler) {
            /**
             * TOP LEFT
             */
            case "nw":
              this.$emit(
                "update:components",
                this.components.map((c) => {
                  if (c.selected) {
                    const currentBottomY = c.y + c.height;
                    const currentRightX = c.x + c.width;

                    let offsetY = e.offsetY * (100 / this.zoom) - c.resizingOffset.y;
                    let offsetX = e.offsetX * (100 / this.zoom) - c.resizingOffset.x;

                    let newTopY, newLeftX;

                    if (this.snapToGrid) {
                      newTopY =
                        Math.round((c.resizingOffset.y + offsetY) / this.gridSize) *
                        this.gridSize;
                      newLeftX =
                        Math.round((c.resizingOffset.x + offsetX) / this.gridSize) *
                        this.gridSize;
                    } else {
                      newTopY = c.resizingOffset.y + offsetY;
                      newLeftX = c.resizingOffset.x + offsetX;
                    }

                    newTopY = Math.max(0, newTopY);
                    newLeftX = Math.max(0, newLeftX);

                    let newHeight = currentBottomY - newTopY;
                    let newWidth = currentRightX - newLeftX;

                    if (newHeight < 0) {
                      newHeight = 0;
                      newTopY = currentBottomY;
                    }

                    if (newWidth < 0) {
                      newWidth = 0;
                      newLeftX = currentRightX;
                    }

                    return {
                      ...c,
                      x: newLeftX,
                      y: newTopY,
                      width: newWidth,
                      height: newHeight,
                    };
                  }
                  return c;
                })
              );
              break;

            /**
             * Top Center
             */
            case "nc":
              this.$emit(
                "update:components",
                this.components.map((c) => {
                  if (c.selected) {
                    const currentBottomY = c.y + c.height;
                    let offsetY = e.offsetY * (100 / this.zoom) - c.resizingOffset.y;
                    let newTopY;

                    if (this.snapToGrid) {
                      newTopY =
                        Math.round((c.resizingOffset.y + offsetY) / this.gridSize) *
                        this.gridSize;
                    } else {
                      newTopY = c.resizingOffset.y + offsetY;
                    }

                    let newHeight = currentBottomY - newTopY;
                    if (newHeight < 0) {
                      newHeight = 0;
                      newTopY = currentBottomY;
                    }

                    return { ...c, y: newTopY, height: newHeight };
                  }
                  return c;
                })
              );
              break;

            /**
             * Top Right
             */
            case "ne":
              this.$emit(
                "update:components",
                this.components.map((c) => {
                  if (c.selected) {
                    const offsetY = e.offsetY * (100 / this.zoom) - c.resizingOffset.y;
                    const offsetX = e.offsetX * (100 / this.zoom);
                    let newTopY;

                    if (this.snapToGrid) {
                      newTopY =
                        Math.round((c.resizingOffset.y + offsetY) / this.gridSize) *
                        this.gridSize;
                    } else {
                      newTopY = c.resizingOffset.y + offsetY;
                    }

                    newTopY = Math.max(0, newTopY);

                    let newHeight = c.y + c.height - newTopY;
                    if (newHeight < 0) {
                      newHeight = 0;
                      newTopY = c.y + c.height;
                    }

                    let newRightEdge = offsetX;
                    let newWidth = newRightEdge - c.x;

                    if (this.snapToGrid) {
                      newWidth = Math.round(newWidth / this.gridSize) * this.gridSize;
                    }

                    if (newWidth < 0) {
                      newWidth = 0;
                    }

                    return { ...c, y: newTopY, width: newWidth, height: newHeight };
                  }
                  return c;
                })
              );
              break;

            /**
             * Middle Left
             */
            case "mw":
              this.$emit(
                "update:components",
                this.components.map((c) => {
                  if (c.selected) {
                    const currentRightX = c.x + c.width;
                    let offsetX = e.offsetX * (100 / this.zoom) - c.resizingOffset.x;

                    let newLeftX;
                    if (this.snapToGrid) {
                      newLeftX =
                        Math.round((c.resizingOffset.x + offsetX) / this.gridSize) *
                        this.gridSize;
                    } else {
                      newLeftX = c.resizingOffset.x + offsetX;
                    }

                    newLeftX = Math.max(0, newLeftX);

                    let newWidth = currentRightX - newLeftX;
                    if (newWidth < 0) {
                      newWidth = 0;
                      newLeftX = currentRightX;
                    }

                    return {
                      ...c,
                      x: newLeftX,
                      width: newWidth,
                    };
                  }
                  return c;
                })
              );
              break;

            /**
             * Middle Right
             */
            case "me":
              this.$emit(
                "update:components",
                this.components.map((c) => {
                  if (c.selected) {
                    const offsetX = e.offsetX * (100 / this.zoom) - c.resizingOffset.x;
                    let width;
                    if (this.snapToGrid) {
                      width = Math.round(offsetX / this.gridSize) * this.gridSize - c.x;
                    } else {
                      width = offsetX - c.x;
                    }
                    if (width < 0) width = 0;
                    return { ...c, width };
                  }
                  return c;
                })
              );
              break;

            /**
             * Bottom Left
             */
            case "sw":
              this.$emit(
                "update:components",
                this.components.map((c) => {
                  if (c.selected) {
                    let offsetX = e.offsetX * (100 / this.zoom) - c.resizingOffset.x;
                    let offsetY = e.offsetY * (100 / this.zoom) - c.resizingOffset.y;

                    let newLeftX;
                    let newBottomY;

                    if (this.snapToGrid) {
                      newLeftX =
                        Math.round((c.resizingOffset.x + offsetX) / this.gridSize) *
                        this.gridSize;
                      newBottomY =
                        Math.round((c.resizingOffset.y + offsetY) / this.gridSize) *
                        this.gridSize;
                    } else {
                      newLeftX = c.resizingOffset.x + offsetX;
                      newBottomY = c.resizingOffset.y + offsetY;
                    }

                    newLeftX = Math.max(0, newLeftX);
                    newBottomY = Math.max(c.y, newBottomY);

                    let newWidth = c.x + c.width - newLeftX;
                    let newHeight = newBottomY - c.y;

                    if (newWidth < 0) {
                      newWidth = 0;
                      newLeftX = c.x + c.width;
                    }
                    if (newHeight < 0) {
                      newHeight = 0;
                      newBottomY = c.y;
                    }

                    return {
                      ...c,
                      x: newLeftX,
                      width: newWidth,
                      height: newHeight,
                    };
                  }
                  return c;
                })
              );
              break;

            /**
             * Bottom Center
             */
            case "sc":
              this.$emit(
                "update:components",
                this.components.map((c) => {
                  if (c.selected) {
                    const offsetY = e.offsetY * (100 / this.zoom) - c.resizingOffset.y;
                    let height;
                    if (this.snapToGrid) {
                      height = Math.round(offsetY / this.gridSize) * this.gridSize - c.y;
                    } else {
                      height = offsetY - c.y;
                    }
                    if (height < 0) height = 0;
                    return { ...c, height };
                  }
                  return c;
                })
              );
              break;

            /**
             * Bottom Right
             */
            case "se":
              this.$emit(
                "update:components",
                this.components.map((c) => {
                  if (c.selected) {
                    const offsetX = e.offsetX * (100 / this.zoom) - c.resizingOffset.x;
                    const offsetY = e.offsetY * (100 / this.zoom) - c.resizingOffset.y;

                    let width, height;
                    if (this.snapToGrid) {
                      width = Math.round(offsetX / this.gridSize) * this.gridSize - c.x;
                    } else {
                      width = offsetX - c.x;
                    }

                    if (this.snapToGrid) {
                      height = Math.round(offsetY / this.gridSize) * this.gridSize - c.y;
                    } else {
                      height = offsetY - c.y;
                    }

                    width = Math.max(0, width);
                    height = Math.max(0, height);

                    return { ...c, width, height };
                  }
                  return c;
                })
              );
              break;
          }
        }
      }
    },
    onDesignSurfaceKeyUp(e) {
      // Delete selected components
      if (e.key === "Delete") {
        const selectedComponents = this.components.filter((c) => c.selected);
        if (selectedComponents.length > 0) {
          this.$emit(
            "update:components",
            this.components.filter((c) => !c.selected)
          );
        }
      }
      // Move selected components with arrow keys
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        const selectedComponents = this.components.filter((c) => c.selected);
        if (selectedComponents.length > 0) {
          const increment = this.snapToGrid ? this.gridSize : 1;
          this.$emit(
            "update:components",
            this.components.map((c) => {
              if (c.selected) {
                let x = c.x;
                let y = c.y;
                if (e.key === "ArrowUp") y -= increment;
                if (e.key === "ArrowDown") y += increment;
                if (e.key === "ArrowLeft") x -= increment;
                if (e.key === "ArrowRight") x += increment;
                if (x < 0) x = 0;
                if (y < 0) y = 0;
                return { ...c, x, y };
              }
              return c;
            })
          );
        }
      }
    },
  },
  mounted() {
    this.initializeCanvas();
    window.addEventListener("resize", this.handleResize);

    const container = this.$refs.container;
    if (container) {
      this.containerObserver = new ResizeObserver(() => {
        this.initializeCanvas();
      });
      this.containerObserver.observe(container);
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this.containerObserver) {
      this.containerObserver.disconnect();
    }
  },
  watch: {
    gridType() {
      this.initializeCanvas();
    },
    gridColor() {
      this.initializeCanvas();
    },
    gridSize() {
      this.reactiveGridSize = this.gridSize;
      this.initializeCanvas();
    },
    zoom() {
      this.reactiveZoom = this.zoom;
      this.initializeCanvas();
    },
    snapToGrid() {
      this.reactiveSnapToGrid = this.snapToGrid;
    },
    components: {
      handler(newItems, oldItems) {
        // Compare oldItems and newItems to detect changes in properties and log them to the console.
        newItems.forEach((newItem, index) => {
          if (!oldItems || !oldItems[index]) return;
          const oldItem = oldItems[index];
          // Assuming each item has a unique identifier 'id'
          if (oldItem && newItem.id === oldItem.id) {
            // Now compare properties of newItem and oldItem
            Object.keys(newItem).forEach((key) => {
              if (newItem[key] !== oldItem[key]) {
                /*console.log(
                  `Change detected in item with id ${newItem.id} for property '${key}':`,
                  { from: oldItem[key], to: newItem[key] }
                );*/
              }
            });
          }
        });
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>

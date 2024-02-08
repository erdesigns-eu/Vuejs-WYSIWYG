<template>
  <div
    class="selectbox"
    @focus="focus"
    @blur="blur"
    tabindex="0"
    role="select"
    ref="select"
  >
    <div class="selection" :class="{ expanded: expanded }" @click="toggle">
      <span class="label">{{ selectedLabel }}</span>
      <span class="mdi mdi-chevron-down"></span>
    </div>
    <div class="items" :class="{ expanded: expanded }" v-show="expanded">
      <div class="items-wrapper">
        <div
          class="option"
          v-for="(option, index) in options"
          :key="index"
          :class="{ selected: index === modelValue && selected }"
          @click="select(index)"
          @mouseover="optionMouseOver(index)"
        >
          <span class="label">{{ option.label }}</span>
          <span class="default" v-if="index === defaultOption">{{
            $t("Common.Default")
          }}</span>
        </div>
      </div>
      <div class="description" v-if="showDescription">
        {{ selectedDescription }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SelectBox",
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: Object,
      type: Number,
    },
    options: {
      type: Array,
      required: true,
    },
    defaultOption: {
      type: Number,
      default: -1,
    },
    showDescription: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      focused: false,
      expanded: false,
      selected: false,
      mouseover: -1,
    };
  },
  methods: {
    focus() {
      this.focused = true;
    },
    blur() {
      this.focused = false;
      this.close();
    },
    open() {
      this.expanded = true;
      this.selected = true;
      this.$nextTick(() => {
        this.makeSelectedItemVisible();
      });
    },
    close() {
      this.expanded = false;
      this.mouseover = -1;
    },
    toggle() {
      if (!this.expanded) {
        this.open();
      } else {
        this.close();
      }
    },
    select(index) {
      this.expanded = false;
      this.$emit("update:modelValue", index);
    },
    optionMouseOver(index) {
      this.selected = false;
      this.mouseover = index;
    },
    handleEscapeKey(event) {
      if (event.key === "Escape") {
        this.close();
      }
    },
    handleKeys(event) {
      if (
        event.key === "Up" ||
        event.key === "ArrowUp" ||
        event.key === "Left" ||
        event.key === "ArrowLeft"
      ) {
        this.mouseover = -1;
        this.selected = true;
        if (this.modelValue > 0) {
          this.$emit("update:modelValue", this.modelValue - 1);
        }
        this.makeSelectedItemVisible();
      } else if (
        event.key === "Down" ||
        event.key === "ArrowDown" ||
        event.key === "Right" ||
        event.key === "ArrowRight"
      ) {
        this.mouseover = -1;
        this.selected = true;
        if (this.modelValue < this.options.length - 1) {
          this.$emit("update:modelValue", this.modelValue + 1);
        }
        this.makeSelectedItemVisible();
      } else if (event.key === "Enter" || event.key === " ") {
        if (this.expanded) {
          this.select(this.modelValue);
        } else {
          this.open();
        }
      } else {
        const key = event.key.toLowerCase();
        const index = this.options.findIndex((option) => {
          return option.label.toLowerCase().startsWith(key);
        });
        if (index !== -1) {
          this.mouseover = index;
          this.selected = true;
          this.$emit("update:modelValue", index);
          this.$nextTick(() => {
            this.makeSelectedItemVisible();
          });
        }
      }
    },
    makeSelectedItemVisible() {
      const vm = this;
      const select = vm.$refs.select;
      const selectItem = select.querySelector(".option.selected");
      if (selectItem) {
        selectItem.scrollIntoView({
          block: "center",
          inline: "center",
        });
      }
    },
    getIndexOfLabel(label) {
      return this.options.findIndex((option) => {
        return option.label === label;
      });
    },
  },
  computed: {
    selectedLabel() {
      if (this.modelValue !== -1) {
        return this.options[this.modelValue].label;
      }
      return "";
    },
    selectedDescription() {
      if (this.mouseover !== -1) {
        return this.options[this.mouseover].description || "";
      }
      if (this.modelValue !== -1) {
        return this.options[this.modelValue].description || "";
      }
      return "";
    },
  },
  watch: {
    expanded(val) {
      if (val) {
        window.addEventListener("keydown", this.handleEscapeKey);
      } else {
        window.removeEventListener("keydown", this.handleEscapeKey);
      }
    },
    focused(val) {
      if (val) {
        window.addEventListener("keydown", this.handleKeys);
      } else {
        window.removeEventListener("keydown", this.handleKeys);
      }
    },
  },
};
</script>

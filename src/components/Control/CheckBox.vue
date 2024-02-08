<template>
  <div
    class="checkbox mdi"
    role="checkbox"
    :class="checkedClass"
    @focus="focus"
    @blur="blur"
    @click="toggle"
    tabindex="0"
  ></div>
</template>

<script>
export default {
  name: "CheckBox",
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: [Boolean, String, Number, Array, Object],
      default: false,
    },
    trueValue: {
      type: [Boolean, String, Number, Array, Object],
      default: true,
    },
    falseValue: {
      type: [Boolean, String, Number, Array, Object],
      default: false,
    },
    checkedIcon: {
      type: String,
      default: "mdi-check",
    },
  },
  data() {
    return {
      focused: false,
    };
  },
  computed: {
    checkedClass() {
      return this.isChecked ? this.checkedIcon : "";
    },
    isChecked() {
      if (typeof this.modelValue === "boolean") {
        return this.modelValue === this.trueValue;
      }
      if (typeof this.modelValue === "string") {
        return this.modelValue === String(this.trueValue);
      }
      if (typeof this.modelValue === "number") {
        return this.modelValue === Number(this.trueValue);
      }
      if (Array.isArray(this.modelValue)) {
        return this.modelValue.includes(this.trueValue);
      }
      if (typeof this.modelValue === "object") {
        return this.modelValue === this.trueValue;
      }
      return false;
    },
  },
  methods: {
    focus() {
      this.focused = true;
    },
    blur() {
      this.focused = false;
    },
    toggle() {
      if (typeof this.modelValue === "boolean") {
        this.$emit(
          "update:modelValue",
          this.modelValue === this.trueValue ? this.falseValue : this.trueValue
        );
      }
      if (typeof this.modelValue === "string") {
        this.$emit(
          "update:modelValue",
          this.modelValue === String(this.trueValue)
            ? this.falseValue
            : this.trueValue
        );
      }
      if (typeof this.modelValue === "number") {
        this.$emit(
          "update:modelValue",
          this.modelValue === Number(this.trueValue)
            ? this.falseValue
            : this.trueValue
        );
      }
      if (Array.isArray(this.modelValue)) {
        if (this.modelValue.includes(this.trueValue)) {
          this.$emit(
            "update:modelValue",
            this.modelValue.filter((value) => value !== this.trueValue)
          );
        } else {
          this.$emit("update:modelValue", [...this.modelValue, this.trueValue]);
        }
      }
      if (typeof this.modelValue === "object") {
        this.$emit(
          "update:modelValue",
          this.modelValue === this.trueValue ? this.falseValue : this.trueValue
        );
      }
    },
    handleKeys(event) {
      if (event.key === "Enter" || event.key === " ") {
        this.toggle();
      }
    },
  },
  watch: {
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

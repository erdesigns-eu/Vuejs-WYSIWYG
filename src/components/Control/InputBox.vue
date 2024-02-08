<template>
  <div class="inputbox" :class="{ focus: inputFocused }">
    <div class="inputbox-wrapper">
      <input
        ref="input"
        :autocomplete="autocompleteString"
        :autocorrect="autocorrectString"
        :autocapitalize="autocapitalizeString"
        :spellcheck="spellcheck"
        :type="type"
        :wrap="wrap"
        :maxlength="maxLength"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        :name="name"
        @focus="focus()"
        @blur="blur()"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "InputBox",
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    autocomplete: {
      type: Boolean,
      default: false,
    },
    autocorrect: {
      type: Boolean,
      default: false,
    },
    autocapitalize: {
      type: Boolean,
      default: false,
    },
    spellcheck: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "text",
    },
    wrap: {
      type: String,
      default: "soft",
    },
    maxLength: {
      type: Number,
      default: -1,
    },
    placeholder: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      inputFocused: false,
    };
  },
  computed: {
    autocorrectString() {
      return this.autocorrect ? "on" : "off";
    },
    autocapitalizeString() {
      return this.autocapitalize ? "on" : "off";
    },
    autocompleteString() {
      return this.autocomplete ? "on" : "off";
    },
  },
  methods: {
    focus() {
      if (!this.disabled) {
        this.inputFocused = true;
      } else {
        this.inputFocused = false;
      }
    },
    blur() {
      this.inputFocused = false;
    },
    setFocus() {
      this.$refs.input.focus();
    },
  },
};
</script>

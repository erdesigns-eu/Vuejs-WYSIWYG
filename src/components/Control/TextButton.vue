<template>
  <a
    class="textbutton"
    :class="{ primary: primary, disabled: disabled }"
    tabindex="0"
    role="button"
    :aria-label="text"
  >
    <slot>{{ text }}</slot>
  </a>
</template>

<script>
export default {
  name: "TextButton",
  props: {
    text: {
      type: String,
      default: "",
    },
    primary: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

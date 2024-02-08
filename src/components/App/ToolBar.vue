<template>
  <div class="app-toolbar">
    <ul class="app-toolbar-items">
      <li
        class="app-toolbar-item"
        v-for="(item, index) in items"
        :key="`toolbar-item-${index}`"
      >
        <div class="app-toolbar-divider" v-if="item.divider"></div>
        <a
          class="app-toolbar-button"
          :class="{ disabled: item.disabled, selected: item.selected }"
          @click="handleClick"
          v-else
        >
          <i class="mdi" :class="item.icon"></i>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "ToolBar",
  emits: ["click"],
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  methods: {
    handleClick(item) {
      if (!item.disabled) {
        this.$emit("click", item);
      }
    },
  },
};
</script>

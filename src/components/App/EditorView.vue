<template>
  <div
    v-if="show"
    class="editor-view"
    :style="{
      width: `${width}px`,
      minWidth: `${minWidth}px`,
      maxWidth: `${maxWidth}px`,
    }"
  >
    <div class="editor-view-content">
      <slot :name="selectedView"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "EditorView",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    views: {
      type: Array,
      required: true,
    },
    selectedView: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      default: 300,
    },
    minWidth: {
      type: Number,
      default: 200,
    },
    maxWidth: {
      type: Number,
      default: 500,
    },
  },
};
</script>

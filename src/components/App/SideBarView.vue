<template>
  <div
    class="sidebar-view"
    :style="{
      width: `${width}px`,
      minWidth: `${minWidth}px`,
      maxWidth: `${maxWidth}px`,
    }"
  >
    <div class="sidebar-view-title">
      <div class="title-label">
        <h2 :title="selectedViewLabel">{{ selectedViewLabel }}</h2>
      </div>
    </div>
    <div class="sidebar-view-content">
      <slot :name="selectedView"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "SideBarView",
  props: {
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
  computed: {
    selectedViewLabel() {
      const vm = this;
      if (vm.selectedView < 0 || vm.selectedView >= vm.views.length) {
        return "";
      }
      return vm.$t(vm.views[vm.selectedView].label);
    },
  },
};
</script>

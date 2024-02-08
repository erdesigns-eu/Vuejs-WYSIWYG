<template>
  <div
    v-if="show"
    class="editor-view-splitter"
    :class="{ active: isResizing }"
    @mousedown="startResize"
  ></div>
</template>

<script>
export default {
  name: "EditorViewSplitter",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      isResizing: false,
    };
  },
  methods: {
    startResize() {
      this.isResizing = true;
      document.querySelector("body").classList.add("resizing-v");
      document.querySelector("body").addEventListener("mousemove", this.resize);
      document
        .querySelector("body")
        .addEventListener("mouseup", this.stopResize);
      document
        .querySelector("body")
        .addEventListener("mouseleave", this.stopResize);
    },
    resize(e) {
      if (this.isResizing) {
        // Get width of main view
        const mainView = document.querySelector(".main");
        const mainViewWidth = mainView.offsetWidth;
        //
        const x = mainViewWidth - e.pageX;
        this.$emit("resize", x);
      }
    },
    stopResize() {
      this.isResizing = false;
      document.querySelector("body").classList.remove("resizing-v");
      document
        .querySelector("body")
        .removeEventListener("mousemove", this.resize);
      document
        .querySelector("body")
        .removeEventListener("mouseup", this.stopResize);
      document
        .querySelector("body")
        .removeEventListener("mouseleave", this.stopResize);
    },
  },
};
</script>

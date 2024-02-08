<template>
  <transition
    :name="name"
    @before-appear="beforeAppear"
    @appear="appear"
    @after-appear="afterAppear"
    @appear-cancelled="appearCancelled"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @enter-cancelled="enterCancelled"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
    @leave-cancelled="leaveCancelled"
  >
    <slot></slot>
  </transition>
</template>

<script>
export default {
  name: "CollapseTransition",
  emits: [
    "before-appear",
    "appear",
    "after-appear",
    "appear-cancelled",
    "before-enter",
    "enter",
    "after-enter",
    "enter-cancelled",
    "before-leave",
    "leave",
    "after-leave",
    "leave-cancelled",
  ],
  props: {
    name: {
      type: String,
      default: "collapse",
    },
    duration: {
      type: Number,
      default: 300,
    },
    easing: {
      type: String,
      default: "ease-in-out",
    },
  },
  data() {
    return {
      cachedStyles: null,
    };
  },
  computed: {
    transition() {
      let transitions = [];
      // Loop through the cached styles and build the transition string
      Object.keys(this.cachedStyles).forEach((key) => {
        transitions.push(
          `${this.convertToCssProperty(key)} ${this.duration}ms ${this.easing}`
        );
      });
      // Return the transition string
      return transitions.join(", ");
    },
  },
  methods: {
    beforeAppear(el) {
      this.$emit("before-appear", el);
    },
    appear(el) {
      this.$emit("appear", el);
    },
    afterAppear(el) {
      this.$emit("after-appear", el);
    },
    appearCancelled(el) {
      this.$emit("appear-cancelled", el);
    },
    beforeEnter(el) {
      this.$emit("before-enter", el);
    },
    enter(el, done) {
      // Because width and height may be 'auto',
      // first detect and cache the dimensions
      this.detectAndCacheDimensions(el);

      // The order of applying styles is important:
      // - 1. Set styles for state before transition
      // - 2. Force repaint
      // - 3. Add transition style
      // - 4. Set styles for state after transition
      // If the order is not right and you open any 2nd level submenu
      // for the first time, the transition will not work.
      this.setClosedDimensions(el);
      this.hideOverflow(el);
      this.forceRepaint(el);
      this.setTransition(el);
      this.setOpenedDimensions(el);

      // Emit the enter event
      this.$emit("enter", el, done);

      // Call done() when the transition ends
      // to trigger the @after-enter event.
      setTimeout(done, this.duration);
    },
    afterEnter(el) {
      // Clean up inline styles
      this.unsetOverflow(el);
      this.unsetTransition(el);
      this.unsetDimensions(el);
      this.clearCachedDimensions();

      // Emit the after-enter event
      this.$emit("after-enter", el);
    },
    enterCancelled(el) {
      this.$emit("enter-cancelled", el);
    },
    beforeLeave(el) {
      this.$emit("before-leave", el);
    },
    leave(el, done) {
      // For some reason, @leave triggered when starting
      // from open state on page load. So for safety,
      // check if the dimensions have been cached.
      this.detectAndCacheDimensions(el);

      // The order of applying styles is less important
      // than in the enter phase, as long as we repaint
      // before setting the closed dimensions.
      // But it is probably best to use the same
      // order as the enter phase.
      this.setOpenedDimensions(el);
      this.hideOverflow(el);
      this.forceRepaint(el);
      this.setTransition(el);
      this.setClosedDimensions(el);

      // Emit the leave event
      this.$emit("leave", el, done);

      // Call done() when the transition ends
      // to trigger the @after-leave event.
      // This will also cause v-show
      // to reapply 'display: none'.
      setTimeout(done, this.duration);
    },
    afterLeave(el) {
      // Clean up inline styles
      this.unsetOverflow(el);
      this.unsetTransition(el);
      this.unsetDimensions(el);
      this.clearCachedDimensions();

      // Emit the after-leave event
      this.$emit("after-leave", el);
    },
    leaveCancelled(el) {
      this.$emit("leave-cancelled", el);
    },
    detectAndCacheDimensions(el) {
      // Cache actual dimensions
      // only once to void invalid values when
      // triggering during a transition
      if (this.cachedStyles) {
        return;
      }

      const visibility = el.style.visibility;
      const display = el.style.display;

      // Trick to get the width and
      // height of a hidden element
      el.style.visibility = "hidden";
      el.style.display = "";

      // Cache the dimensions
      this.cachedStyles = this.detectRelevantDimensions(el);

      // Restore any original styling
      el.style.visibility = visibility;
      el.style.display = display;
    },
    clearCachedDimensions() {
      this.cachedStyles = null;
    },
    detectRelevantDimensions(el) {
      return {
        height: el.offsetHeight + "px",
        paddingTop: el.style.paddingTop || this.getCssValue(el, "padding-top"),
        paddingBottom: el.style.paddingBottom || this.getCssValue(el, "padding-bottom"),
      };
    },
    setTransition(el) {
      el.style.transition = this.transition;
    },
    unsetTransition(el) {
      el.style.transition = "";
    },
    hideOverflow(el) {
      el.style.overflow = "hidden";
    },
    unsetOverflow(el) {
      el.style.overflow = "";
    },
    setClosedDimensions(el) {
      Object.keys(this.cachedStyles).forEach((key) => (el.style[key] = "0"));
    },
    setOpenedDimensions(el) {
      Object.keys(this.cachedStyles).forEach(
        (key) => (el.style[key] = this.cachedStyles[key])
      );
    },
    unsetDimensions(el) {
      Object.keys(this.cachedStyles).forEach((key) => (el.style[key] = ""));
    },
    forceRepaint(el) {
      // Force repaint to make sure the animation is triggered correctly.
      // Thanks: https://markus.oberlehner.net/blog/transition-to-height-auto-with-vue/
      getComputedStyle(el)["height"];
    },
    getCssValue(el, style) {
      return getComputedStyle(el, null).getPropertyValue(style);
    },
    convertToCssProperty(style) {
      // Example: convert 'paddingTop' to 'padding-top'
      // Thanks: https://gist.github.com/tan-yuki/3450323
      const upperChars = style.match(/([A-Z])/g);

      // If the string is all lowercase, just return it
      if (!upperChars) {
        return style;
      }

      // Convert the string to lowercase
      for (let i = 0, n = upperChars.length; i < n; i++) {
        style = style.replace(
          new RegExp(upperChars[i]),
          "-" + upperChars[i].toLowerCase()
        );
      }

      // Remove everything before the first dash
      if (style.slice(0, 1) === "-") {
        style = style.slice(1);
      }

      return style;
    },
  },
};
</script>

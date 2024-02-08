<template>
  <div class="statusbar">
    <div class="left-items">
      <div
        v-for="(item, itemIndex) in leftPanelItems"
        :key="itemIndex"
        class="statusbar-item"
        :aria-label="item.label"
        :style="{ color: item.color, backgroundColor: item.backgroundColor }"
      >
        <a
          tabindex="-1"
          role="button"
          class="statusbar-item-label"
          :class="{ disabled: item.disabled }"
          :aria-label="item.label"
          @click="onLeftPanelItemClick(itemIndex, item)"
        >
          <span
            class="mdi"
            :class="item.icon"
            v-if="item.icon !== undefined"
          ></span>
          {{ item.content }}
        </a>
      </div>
    </div>
    <div class="right-items">
      <div
        v-for="(item, itemIndex) in rightPanelItems"
        :key="itemIndex"
        class="statusbar-item"
        :aria-label="item.label"
        :style="{ color: item.color, backgroundColor: item.backgroundColor }"
      >
        <a
          tabindex="-1"
          role="button"
          class="statusbar-item-label"
          :class="{ disabled: item.disabled }"
          :aria-label="item.label"
          @click="onRightPanelItemClick(itemIndex, item)"
        >
          <span
            class="mdi"
            :class="item.icon"
            v-if="item.icon !== undefined"
          ></span>
          {{ item.content }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StatusBar",
  emits: ["left-panel-item-click", "right-panel-item-click"],
  props: {
    leftPanelItems: {
      type: Array,
      default: [],
    },
    rightPanelItems: {
      type: Array,
      default: [],
    },
  },
  methods: {
    onLeftPanelItemClick(itemIndex, item) {
      if (!item.disabled) {
        this.$emit("left-panel-item-click", itemIndex);
      }
    },
    onRightPanelItemClick(itemIndex, item) {
      if (!item.disabled) {
        this.$emit("right-panel-item-click", itemIndex);
      }
    },
  },
};
</script>

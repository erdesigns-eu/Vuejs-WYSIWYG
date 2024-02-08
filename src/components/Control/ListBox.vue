<template>
  <div class="listbox" @focus="focus" @blur="blur" tabindex="0">
    <div class="listbox-container">
      <template v-for="(item, itemIndex) in items" :key="itemIndex">
        <div class="listbox-title-large" v-if="item.largeTitle">{{ $t(item.label) }}</div>
        <div class="listbox-title-small" v-if="item.smallTitle">{{ $t(item.label) }}</div>
        <a
          v-if="
            item.divider !== true && item.largeTitle !== true && item.smallTitle !== true
          "
          :aria-label="$t(item.label)"
          role="list-item"
          class="listbox-item"
          :class="{ selected: isSelectedItem(item) }"
          @click="onItemClick(item)"
        >
          <span
            class="listbox-item-icon mdi"
            :class="item.icon"
            v-if="item.icon !== undefined && item.icon.length"
          ></span>
          <span class="listbox-item-text">{{ $t(item.label) }}</span>
        </a>
        <div class="listbox-item-divider" v-if="item.divider" role="separator"></div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "ListBox",
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      focused: false,
    };
  },
  computed: {
    filteredItems() {
      return this.items.filter((item) => {
        return (
          item.divider !== true && item.largeTitle !== true && item.smallTitle !== true
        );
      });
    },
  },
  methods: {
    focus() {
      this.focused = true;
    },
    blur() {
      this.focused = false;
    },
    isSelectedItem(item) {
      return item && this.filteredItems.indexOf(item) === this.modelValue;
    },
    onItemClick(item) {
      const itemIndex = this.filteredItems.indexOf(item);
      this.$emit("update:modelValue", itemIndex);
    },
    isItemDivider(item) {
      return item && item.divider === true;
    },
    makeSelectedItemVisible() {
      const vm = this;
      const listbox = vm.$el;
      const listboxItem = listbox.querySelector(".listbox-item.selected");
      if (listboxItem) {
        listboxItem.scrollIntoView({
          block: "center",
          inline: "center",
        });
      }
    },
    arrowUp() {
      if (this.modelValue > 0) {
        if (this.isItemDivider(this.items[this.modelValue - 1])) {
          if (this.modelValue - 2 >= 0) {
            this.$emit("update:modelValue", this.modelValue - 2);
          }
        } else {
          this.$emit("update:modelValue", this.modelValue - 1);
        }
      }
    },
    arrowDown() {
      if (this.modelValue < this.items.length - 1) {
        if (this.isItemDivider(this.items[this.modelValue + 1])) {
          if (this.modelValue + 2 < this.items.length) {
            this.$emit("update:modelValue", this.modelValue + 2);
          }
        } else {
          this.$emit("update:modelValue", this.modelValue + 1);
        }
      }
    },
    onKeydown(event) {
      const vm = this;
      if (event.key === "ArrowUp" && vm.modelValue > 0) {
        event.preventDefault();
        vm.arrowUp();
        vm.makeSelectedItemVisible();
      } else if (
        event.key === "ArrowDown" &&
        vm.modelValue < vm.filteredItems.length - 1
      ) {
        event.preventDefault();
        vm.arrowDown();
        vm.makeSelectedItemVisible();
      } else if (event.key === "Home") {
        event.preventDefault();
        vm.$emit("update:modelValue", 0);
        vm.makeSelectedItemVisible();
      } else if (event.key === "End") {
        event.preventDefault();
        vm.$emit("update:modelValue", vm.filteredItems.length - 1);
        vm.makeSelectedItemVisible();
      }
    },
  },
  watch: {
    focused(focused) {
      if (focused) {
        // Add event listener for keydown
        window.addEventListener("keydown", this.onKeydown);
      } else {
        // Remove event listener for keydown
        window.removeEventListener("keydown", this.onKeydown);
      }
    },
  },
};
</script>

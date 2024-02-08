<template>
  <div class="app-sidebar">
    <div class="actions">
      <div class="action-bar">
        <ul
          class="actions-container"
          role="tablist"
          aria-label="Active View Switcher"
        >
          <li
            v-for="(action, actionIndex) in actions"
            :key="actionIndex"
            class="action-item"
            :class="{ checked: selectedAction === actionIndex }"
            role="tab"
            :aria-label="$t(action.label)"
          >
            <a
              class="action-label mdi"
              :class="[{ disabled: action.disabled }, action.icon]"
              :aria-label="$t(action.label)"
              @click="onActionSelect(actionIndex, action)"
            ></a>
            <div
              class="badge"
              :aria-label="$t(action.label)"
              :style="{ display: action.badge.visible ? 'block' : 'none' }"
              :aria-hidden="!action.badge.visible"
            >
              <div
                class="badge-content"
                :style="{
                  color: action.badge.color,
                  backgroundColor: action.badge.backgroundColor,
                }"
              >
                {{ action.badge.content }}
              </div>
            </div>
            <div class="active-item-indicator"></div>
          </li>
        </ul>
      </div>
    </div>
    <div class="toolbar">
      <div class="action-bar">
        <ul class="actions-container" role="toolbar" aria-label="Manage">
          <li
            v-for="(button, buttonIndex) in buttons"
            :key="buttonIndex"
            class="action-item"
            role="button"
            :aria-label="$t(button.label)"
          >
            <a
              class="action-label mdi"
              :class="[{ disabled: button.disabled }, button.icon]"
              :aria-label="$t(button.label)"
              @click="onButtonClick(buttonIndex, button)"
            ></a>
            <div
              class="badge"
              :aria-label="$t(button.label)"
              :style="{ display: button.badge.visible ? 'block' : 'none' }"
              :aria-hidden="!button.badge.visible"
            >
              <div
                class="badge-content"
                :style="{
                  color: button.badge.color,
                  backgroundColor: button.badge.backgroundColor,
                }"
              >
                {{ button.badge.content }}
              </div>
            </div>
            <div class="active-item-indicator"></div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SideBar",
  emits: ["action-select", "button-click"],
  props: {
    actions: {
      type: Array,
      required: true,
    },
    buttons: {
      type: Array,
      required: true,
    },
    selectedAction: {
      type: Number,
      required: true,
    },
  },
  methods: {
    onActionSelect(actionIndex, action) {
      if (!action.disabled) {
        this.$emit("action-select", actionIndex);
      }
    },
    onButtonClick(buttonIndex, button) {
      if (!button.disabled) {
        this.$emit("button-click", buttonIndex);
      }
    },
  },
};
</script>

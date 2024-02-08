<template>
  <!-- Context Menu -->
  <context-menu :menu="contextMenu" ref="contextMenu"></context-menu>
  <!-- End Context Menu -->

  <!-- Title Bar -->
  <title-bar :menu="titlebar.menu" :toolbar-buttons="titlebar.toolbarButtons"></title-bar>
  <!-- End Title Bar -->

  <!-- Tool Bar -->
  <tool-bar :items="toolbar.items"></tool-bar>
  <!-- End Tool Bar -->

  <!-- Main -->
  <div class="main" @contextmenu.prevent="openMenuContext">
    <!-- Side Bar -->
    <side-bar
      :actions="sidebar.actions"
      :buttons="sidebar.buttons"
      :selectedAction="sidebar.selectedAction"
      @action-select="onActionSelect"
      @button-click="onSideBarButtonClick"
    ></side-bar>
    <!-- End Side Bar -->

    <div class="main-container">
      <div class="main-left">
        <!-- Side Bar View -->
        <side-bar-view
          v-show="sidebarVisible"
          :width="sidebarView.width"
          :views="sidebar.actions"
          :selectedView="sidebar.selectedAction"
          id="sidebar-view"
        >
        </side-bar-view>
        <!-- End Side Bar View -->

        <!-- Side Bar View Splitter -->
        <side-bar-view-splitter
          v-show="sidebarVisible"
          @resize="onSideBarViewSplitterResize"
        ></side-bar-view-splitter>
        <!-- End Side Bar View Splitter -->
      </div>

      <!-- Design Surface -->
      <div class="main-center">
        <design-surface
          v-model:zoom="designSurface.zoom"
          v-model:components="designSurface.components"
          :grid-type="designSurface.grid.type"
          :grid-color="designSurface.grid.color"
          :grid-size="designSurface.grid.size"
          :snap-to-grid="designSurface.grid.snap"
          :horizontal-guides="designSurface.guides.horizontal"
          :vertical-guides="designSurface.guides.vertical"
          :minimap="designSurface.miniMap.visible"
          :minimap-width="designSurface.miniMap.width"
          :minimap-height="designSurface.miniMap.height"
        ></design-surface>
      </div>
      <!-- End Design Surface -->

      <div class="main-right">
        <!-- Editor View Splitter -->
        <editor-view-splitter
          :show="editorView.show"
          @resize="onEditorViewSplitterResize"
        ></editor-view-splitter>
        <!-- End Editor View Splitter -->

        <!-- Editor View -->
        <editor-view
          :show="editorView.show"
          :width="editorView.width"
          :views="editorView.views"
          :selectedView="editorView.selectedView"
        >
          <template v-slot:0>
            <div>View 1 content</div>
          </template>
          <template v-slot:1>
            <div>View 2 content</div>
          </template>
          <template v-slot:2>
            <div>View 3 content</div>
          </template>
        </editor-view>
        <!-- End Editor View -->
      </div>
    </div>
  </div>
  <!-- End Main -->

  <!-- Status Bar -->
  <status-bar
    :left-panel-items="statusbar.leftPanelItems"
    :right-panel-items="statusbar.rightPanelItems"
    @left-panel-item-click="onStatusBarLeftPanelItemClick"
    @right-panel-item-click="onStatusBarRightPanelItemClick"
  ></status-bar>
  <!-- End Status Bar -->
</template>

<script>
import TitleBar from "@/components/App/TitleBar.vue";
import ToolBar from "@/components/App/ToolBar.vue";
import SideBar from "@/components/App/SideBar.vue";
import SideBarView from "@/components/App/SideBarView.vue";
import EditorView from "@/components/App/EditorView.vue";
import SideBarViewSplitter from "@/components/App/SideBarViewSplitter.vue";
import EditorViewSplitter from "@/components/App/EditorViewSplitter.vue";
import StatusBar from "@/components/App/StatusBar.vue";
import ContextMenu from "@/components/App/ContextMenu.vue";
import DesignSurface from "./components/Designer/DesignSurface.vue";

export default {
  name: "App",
  components: {
    // Main components
    TitleBar,
    ToolBar,
    SideBar,
    SideBarView,
    EditorView,
    SideBarViewSplitter,
    EditorViewSplitter,
    StatusBar,
    ContextMenu,
    // Designer components
    DesignSurface,
  },
  inject: {
    Electron: "electron",
  },
  data() {
    return {
      titlebar: {
        menu: [
          {
            label: "File",
            items: [
              {
                label: "New",
                accelerator: "Ctrl+N",
                items: [
                  {
                    label: "Project",
                    items: [
                      {
                        label: "Electron",
                      },
                      {
                        label: "Vue",
                      },
                      {
                        label: "React",
                      },
                    ],
                  },
                  {
                    label: "File",
                  },
                ],
              },
              {
                divider: true,
              },
              {
                label: "Open",
                accelerator: "Ctrl+O",
              },
              {
                label: "Save",
                accelerator: "Ctrl+S",
              },
              {
                label: "Save As",
                accelerator: "Ctrl+Shift+S",
              },
              {
                label: "Close",
                accelerator: "Ctrl+W",
              },
              {
                label: "Exit",
                accelerator: "Ctrl+Q",
              },
            ],
          },
          {
            label: "Edit",
          },
          {
            label: "View",
          },
          {
            label: "Window",
            items: [
              {
                label: "Developer Tools",
                accelerator: "Ctrl+Shift+I",
                id: "devtools",
              },
            ],
          },
          {
            label: "Help",
            items: [
              {
                label: "About",
                accelerator: "F1",
                id: "about",
              },
            ],
          },
        ],
        toolbarButtons: [
          {
            icon: "mdi-play",
            label: "Play",
            dsiabled: true,
          },
          {
            icon: "mdi-content-save-outline",
            label: "Save",
          },
          {
            icon: "mdi-undo-variant",
            label: "Undo Last Action",
          },
          {
            icon: "mdi-redo-variant",
            label: "Redo Last Action",
          },
        ],
      },
      toolbar: {
        items: [
          {
            icon: "mdi mdi-file",
            disabled: false,
            title: "New File",
          },
          {
            icon: "mdi mdi-folder",
            disabled: false,
            title: "New Folder",
          },
          {
            icon: "mdi mdi-content-save",
            disabled: true,
            title: "Save File",
          },
          {
            divider: true,
          },
          {
            icon: "mdi mdi-play",
            disabled: true,
            title: "Run",
          },
          {
            icon: "mdi mdi-bug-play",
            disabled: true,
            title: "Debug",
          },
          {
            divider: true,
          },
          {
            icon: "mdi mdi-pause",
            disabled: true,
            title: "Pause",
          },
          {
            icon: "mdi mdi-stop",
            disabled: true,
            title: "Stop",
          },
          {
            divider: true,
          },
          {
            icon: "mdi mdi-code-braces",
            disabled: true,
            title: "Code",
          },
          {
            icon: "mdi mdi-application-edit-outline",
            disabled: true,
            selected: true,
            title: "Design",
          },
          {
            icon: "mdi mdi-eye-refresh",
            disabled: true,
            title: "Toggle Preview",
          },
        ],
      },
      sidebar: {
        actions: [
          {
            icon: "mdi-file-tree",
            label: "Sidebar.Structure",
            badge: {
              visible: false,
              content: "",
              color: "",
              backgroundColor: "",
            },
          },
          {
            icon: "mdi-tab-search",
            label: "Sidebar.ObjectInspector",
            badge: {
              visible: false,
              content: "",
              color: "",
              backgroundColor: "",
            },
          },
        ],
        buttons: [
          {
            icon: "mdi-account-circle-outline",
            label: "Sidebar.Account",
            badge: {
              visible: false,
              content: "",
              color: "",
              backgroundColor: "",
            },
          },
          {
            icon: "mdi-cog-outline",
            label: "Sidebar.Settings",
            badge: {
              visible: false,
              content: "",
              color: "",
              backgroundColor: "",
            },
          },
        ],
        selectedAction: 0,
      },
      sidebarView: {
        width: 300,
      },
      main: {
        selectedView: 0,
      },
      editorView: {
        show: true,
        width: 300,
        views: ["Explorer", "Account", "Settings"],
        selectedView: 0,
      },
      statusbar: {
        leftPanelItems: [
          {
            icon: "mdi-information-outline",
            label: "Status",
            content: "Ready",
            disabled: true,
          },
        ],
        rightPanelItems: [
          {
            icon: "mdi-clock-outline",
            label: "Time",
            content: new Date().toLocaleTimeString(),
          },
        ],
      },
      contextMenu: [
        {
          label: "Cut",
          accelerator: "Ctrl+X",
        },
        {
          label: "Copy",
          accelerator: "Ctrl+C",
        },
        {
          label: "Paste",
          accelerator: "Ctrl+V",
        },
        {
          label: "Delete",
          accelerator: "Del",
        },
        {
          divider: true,
        },
        {
          label: "Select All",
          accelerator: "Ctrl+A",
        },
      ],
      designSurface: {
        zoom: 100,
        grid: {
          type: "dot",
          color: "#f8fafdb3",
          size: 8,
          snap: true,
        },
        guides: {
          horizontal: [
            { position: 80, label: "Guide 1" },
            { position: 160, label: "Guide 2" },
            { position: 240, label: "Guide 3" },
          ],
          vertical: [
            { position: 160, label: "Guide 1" },
            { position: 320, label: "Guide 2" },
            { position: 480, label: "Guide 3" },
          ],
        },
        miniMap: {
          visible: true,
          width: 150,
          height: 100,
        },
        components: [
          {
            id: 1,
            width: 100,
            height: 300,
            x: 0,
            y: 0,
            selected: false,
            dragging: false,
            resizing: false,
          },
          {
            id: 2,
            width: 100,
            height: 50,
            x: 200,
            y: 0,
            selected: false,
            dragging: false,
            resizing: false,
          },
          {
            id: 3,
            width: 100,
            height: 50,
            x: 300,
            y: 0,
            selected: false,
            dragging: false,
            resizing: false,
          },
        ],
      },
    };
  },
  computed: {
    sidebarVisible() {
      return this.sidebar.selectedAction !== -1;
    },
  },
  methods: {
    onActionSelect(index) {
      if (index === this.sidebar.selectedAction) {
        this.sidebar.selectedAction = -1;
      } else {
        this.sidebar.selectedAction = index;
        this.main.selectedView = index;
      }
    },
    onSideBarButtonClick(index) {
      console.log("Button click: " + index);
      this.Electron.notification(
        "Click",
        `The sidebar button at index ${index} was clicked!`
      );
    },
    onStatusBarLeftPanelItemClick(index) {
      console.log("Statusbar item click: " + index);
      this.Electron.notification(
        "Click",
        `The statusbar left panel item at index ${index} was clicked!`
      );
    },
    onStatusBarRightPanelItemClick(index) {
      console.log("Statusbar item click: " + index);
      this.Electron.notification(
        "Click",
        `The statusbar right panel item at index ${index} was clicked!`
      );
    },
    onSideBarViewSplitterResize(width) {
      this.sidebarView.width = width;
    },
    onEditorViewSplitterResize(width) {
      this.editorView.width = width;
    },
    openMenuContext(event) {
      event.preventDefault();
      this.$refs.contextMenu.open(event);
    },
  },
  created() {
    const body = document.querySelector("body");
    const platform = this.Electron.platform;
    if (platform === "win32") {
      body.classList.add("windows");
    } else if (platform === "darwin") {
      body.classList.add("mac");
    } else {
      body.classList.add("linux");
    }
    // Listen for the 'menu-item-click' event
    this.Electron.addEventListener("menu-item-click", (event) => {
      if (event.detail.id === "devtools") {
        this.Electron.devTools();
      }
      if (event.detail.id === "about") {
        this.Electron.about();
      }
    });
    // Listen for the 'toolbar-button-click' event
    this.Electron.addEventListener("toolbar-button-click", (event) => {
      console.log("Toolbar button clicked (APP): ", event.detail);
    });
  },
  beforeDestroy() {
    // Remove the 'menu-item-click' event listener
    this.Electron.removeEventListener("menu-item-click");
    // Remove the 'toolbar-button-click' event listener
    this.Electron.removeEventListener("toolbar-button-click");
  },
};
</script>

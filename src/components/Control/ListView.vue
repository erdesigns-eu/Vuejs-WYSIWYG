<template>
  <div
    class="listview"
    :class="{ 'column-resizing': columnResizing !== -1, striped: striped }"
    @focus="onListviewfocus"
    @blur="onListviewBlur"
    @click="onListviewClick"
    @wheel="onListviewMouseWheel"
    @dragover="onListviewDragOver"
    @drop="onListviewDrop"
    tabindex="0"
    ref="listview"
    role="listview"
  >
    <div class="listview-container">
      <div class="listview-header" ref="listHeader">
        <div
          class="listview-column"
          v-for="(column, columnIndex) in internalColumns"
          :ref="`column-${columnIndex}`"
          :key="columnIndex"
          :style="{
            minWidth: `${column.width}px`,
            maxWidth:
              columnIndex < internalColumns.length - 1
                ? `${column.width}px`
                : undefined,
            textAlign: column.align,
          }"
          @click="onColumnClick($event, columnIndex)"
          @dblclick="onColumnDblClick($event, columnIndex)"
        >
          {{ column.label }}
          <div
            class="column-resizer"
            :class="{ active: columnResizing === columnIndex }"
            @mousedown="startColumnResizing($event, columnIndex)"
          >
            <div class="column-resizer-line"></div>
          </div>
        </div>
      </div>
      <div class="listview-body">
        <div
          class="listview-row"
          :class="{
            selected:
              itemIndex === rowIndex ||
              selected.includes(internalRows[rowIndex]),
            dragging: draggable && dragOverItem === rowIndex,
          }"
          v-for="(row, rowIndex) in internalRows"
          :key="rowIndex"
          :draggable="
            draggable &&
            editingCell.rowIndex === -1 &&
            editingCell.columnIndex === -1
          "
          @dragstart="onRowDragStart($event, rowIndex)"
          @dragend="onRowDragEnd"
          @dragenter="onRowDragEnter($event, rowIndex)"
          @dragleave="onRowDragLeave($event, rowIndex)"
          @dragover="onRowDragOver($event, rowIndex)"
          @drop="onRowDragDrop($event, rowIndex)"
          @click="onRowClick($event, rowIndex)"
          @dblclick="onRowDblClick($event, rowIndex)"
        >
          <template
            v-for="(column, columnIndex) in internalColumns"
            :key="columnIndex"
          >
            <!-- Dragged item -->
            <div
              v-if="draggable && dragOverItem === rowIndex"
              class="listview-cell"
              :style="{
                minWidth: `${column.width}px`,
                maxWidth:
                  columnIndex < internalColumns.length - 1
                    ? `${column.width}px`
                    : undefined,
                textAlign: column.align,
              }"
            >
              {{ draggedItem[columnIndex] }}
            </div>
            <!-- End of dragged item -->
            <!-- Normal item -->
            <div
              v-else
              class="listview-cell"
              :style="{
                minWidth: `${column.width}px`,
                maxWidth:
                  columnIndex < internalColumns.length - 1
                    ? `${column.width}px`
                    : undefined,
                textAlign: column.align,
              }"
              :class="{
                editing:
                  editingCell.rowIndex === rowIndex &&
                  editingCell.columnIndex === columnIndex,
              }"
              @dblclick="onCellDblClick($event, rowIndex, columnIndex)"
            >
              <!-- Editable cell (TEXT) -->
              <template
                v-if="
                  (column.type === 'text' || column.type === undefined) &&
                  editingCell.rowIndex === rowIndex &&
                  editingCell.columnIndex === columnIndex
                "
              >
                <input
                  :value="row[columnIndex]"
                  @input="onCellInput($event, rowIndex, columnIndex)"
                  type="text"
                  :style="{ textAlign: column.align }"
                  ref="input"
                />
              </template>
              <!-- End of editable cell (TEXT) -->
              <!-- Editable cell (NUMBER) -->
              <template
                v-else-if="
                  column.type === 'number' &&
                  editingCell.rowIndex === rowIndex &&
                  editingCell.columnIndex === columnIndex
                "
              >
                <input
                  :value="row[columnIndex]"
                  @input="onCellInput($event, rowIndex, columnIndex)"
                  type="number"
                  :style="{ textAlign: column.align }"
                  ref="input"
                />
              </template>
              <!-- End of editable cell (NUMBER) -->
              <!-- Editable cell (CHECKBOX) -->
              <template
                v-else-if="
                  column.type === 'checkbox' &&
                  editingCell.rowIndex === rowIndex &&
                  editingCell.columnIndex === columnIndex
                "
              >
                CHECKBOX HERE
              </template>
              <!-- End of editable cell (CHECKBOX) -->
              <!-- Editable cell (IMAGE) -->
              <template
                v-else-if="
                  column.type === 'image' &&
                  editingCell.rowIndex === rowIndex &&
                  editingCell.columnIndex === columnIndex
                "
              >
                IMAGE HERE
              </template>
              <!-- End of editable cell (IMAGE) -->
              <!-- Non editable cell -->
              <template v-else>{{ row[columnIndex] }}</template>
              <!-- End of non editable cell -->
            </div>
            <!-- End of normal item -->
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { hasParent } from "@/utils/event";

export default {
  name: "ListView",
  emits: [
    "update:columns",
    "update:rows",
    "update:itemIndex",
    "update:selected",
    "column:click",
    "column:dclick",
    "column:resize",
    "row:click",
    "row:dblclick",
    "cell:dblclick",
  ],
  props: {
    columns: {
      type: Array,
      required: true,
    },
    rows: {
      type: Array,
      required: true,
    },
    itemIndex: {
      type: Number,
      default: -1,
    },
    selected: {
      type: Array,
      required: true,
    },
    keepSelected: {
      type: Boolean,
      default: false,
    },
    editOnDblClick: {
      type: Boolean,
      default: false,
    },
    striped: {
      type: Boolean,
      default: false,
    },
    draggable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      focused: false,
      columnResizing: -1,
      editingCell: {
        rowIndex: -1,
        columnIndex: -1,
      },
      draggedItem: null,
      dragOverItem: null,
      internalColumns: this.columns,
      internalRows: this.rows,
      internalItemIndex: this.itemIndex,
      internalSelected: this.selected,
    };
  },
  methods: {
    onListviewfocus() {
      // Set the focus
      this.focused = true;
    },
    onListviewBlur() {
      if (!this.keepSelected) {
        // Clear the item index
        this.internalItemIndex = -1;
        // Clear the selected items
        this.internalSelected = [];
      }
      // Clear the focus
      this.focused = false;
    },
    onRowDragStart(event, rowIndex) {
      if (this.draggable) {
        // Set the effect allowed
        event.dataTransfer.effectAllowed = "move";
        // Set the data type and value of the dragged data
        event.dataTransfer.setData("text/plain", rowIndex);
        // Set the dragged item
        this.draggedItem = this.internalRows[rowIndex];
        // Set the drag over item
        this.dragOverItem = null;
        // Set the item index to the dragged item
        this.internalItemIndex = rowIndex;
        // Clear the selected items
        this.internalSelected = [];
        // Set the drag image to an empty image
        event.dataTransfer.setDragImage(new Image(), 0, 0);
      }
    },
    onRowDragEnd() {
      if (this.draggable) {
        // Reset the dragged item
        this.dragOverItem = null;
      }
    },
    onRowDragEnter(event, rowIndex) {
      if (this.draggable) {
        // Prevent default
        event.preventDefault();
        // Prevent propagation
        event.stopPropagation();
        // Set the drag over item to the row index
        this.dragOverItem = rowIndex;
      }
    },
    onRowDragLeave(event) {
      if (this.draggable) {
        //
      }
    },
    onRowDragOver(event, rowIndex) {
      if (this.draggable) {
        // Prevent default
        event.preventDefault();
        // Set the event data transfer drop effect
        event.dataTransfer.dropEffect = "move";

        // Listview element
        const listview = this.$refs.listview[0];
        // Listview header element
        const listHeader = this.$refs.listHeader[0];
        // If the listview and listview header are available
        if (listview && listHeader) {
          // Get the listview element's bounding rectangle
          const listviewRect = listview.getBoundingClientRect();
          // Get the mouse position relative to the listview element
          const mouseY = event.clientY - listviewRect.top;
          // Get the header height
          const headerHeight = this.$refs.listHeader.clientHeight + 50;

          // Scroll sensitivity and step
          const scrollSensitivity = 20;
          const scrollStep = 1;

          // Check if the mouse is near the top or bottom of the listview
          const scrollUp = mouseY < scrollSensitivity + headerHeight;
          const scrollDown =
            mouseY > listviewRect.height - (scrollSensitivity + headerHeight);

          // Scroll the listview up or down if the mouse is near the top or bottom
          if (scrollUp) {
            listview.scrollTop -= scrollStep;
          } else if (scrollDown) {
            listview.scrollTop += scrollStep;
          }
        }
      }
    },
    onRowDragDrop(event, dropIndex) {
      if (this.draggable) {
        // Prevent default
        event.preventDefault();
        // Prevent propagation
        event.stopPropagation();
        // Get the dragged index
        const draggedIndex = event.dataTransfer.getData("text/plain");
        // Check if the dragged index is not the same as the drop index
        if (dropIndex !== draggedIndex) {
          // Remove the dragged item from the rows
          const droppedItem = this.internalRows.splice(draggedIndex, 1)[0];
          // Add the dropped item to the rows
          this.internalRows.splice(dropIndex, 0, droppedItem);
          // Set the item index
          this.internalItemIndex = dropIndex;
        }
        // Reset the dragged item
        this.draggedItem = null;
        // Reset the drag over item
        this.dragOverItem = null;
      }
    },
    onListviewDragOver(event) {
      // Prevent default
      event.preventDefault();
      // Prevent propagation
      event.stopPropagation();
      // Set the event data transfer drop effect
      event.dataTransfer.dropEffect = "move";
    },
    onListviewDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.dragOverItem !== null) {
        //console.log("Dropped on listview, last dragover item: " + this.dragOverItem);
        this.onRowDragDrop(event, this.dragOverItem);
      }
    },
    startColumnResizing(event, columnIndex) {
      // Prevent from bubbling up to the listview container
      event.stopPropagation();
      // Prevent from selecting text
      event.preventDefault();
      // Reset editing cell
      this.resetEditingCell();
      // Set the column resizing
      this.columnResizing = columnIndex;
      // Add the mousemove and mouseup event listeners
      document.querySelector("body").classList.add("resizing-v");
      document
        .querySelector("body")
        .addEventListener("mousemove", this.resizeColumn);
      document
        .querySelector("body")
        .addEventListener("mouseup", this.stopColumnResizing);
      document
        .querySelector("body")
        .addEventListener("mouseleave", this.stopColumnResizing);
    },
    resizeColumn(e) {
      if (this.columnResizing > -1) {
        // First get the left position of the column
        const columnLeft =
          this.$refs[`column-${this.columnResizing}`][0].getBoundingClientRect()
            .left;
        // Get the mouse position x coordinate relative to the viewport
        const x = e.clientX;
        // Calculate the new width of the column
        const width = x - columnLeft;
        // Set the new width of the column
        this.internalColumns[this.columnResizing].width = width;
        // Emit the column resize event
        this.$emit("column:resize", this.columnResizing, width);
      }
    },
    stopColumnResizing() {
      this.columnResizing = -1;
      document.querySelector("body").classList.remove("resizing-v");
      document
        .querySelector("body")
        .removeEventListener("mousemove", this.resizeColumn);
      document
        .querySelector("body")
        .removeEventListener("mouseup", this.stopColumnResizing);
      document
        .querySelector("body")
        .removeEventListener("mouseleave", this.stopColumnResizing);
    },
    onRowClick(event, rowIndex) {
      // Prevent from bubbling up to the listview container
      event.stopPropagation();
      // Check if the click is inside the editing cell
      if (hasParent(event.target, "listview-cell")) {
        // Prevent default
        event.preventDefault();
        // Return if the click is inside the editing cell, prevent the row click event
        return;
      }
      // Fire the document click event
      document.body.click();
      // Emit the row click event
      this.$emit("row:click", event, rowIndex);
      // Reset the editing cell
      this.resetEditingCell();
      // Selected row item
      const selected = this.internalRows[rowIndex];
      // Is the ctrl key pressed?
      if (event.ctrlKey) {
        // Is the row item already selected?
        const index = this.selected.indexOf(selected);
        if (index > -1) {
          // Remove the row item from the selected items
          this.internalSelected = [
            ...this.selected.slice(0, index),
            ...this.selected.slice(index + 1),
          ];
          // Change the item index
          this.internalItemIndex = -1;
        } else {
          // Change the item index
          this.internalItemIndex = rowIndex;
          // Add the row item to the selected items
          this.internalSelected = [...this.selected, selected];
        }
      } else if (event.shiftKey) {
        // Change the item index
        this.internalItemIndex = rowIndex;
        // Select the rows between the current and the selected row
        const start = Math.min(this.itemIndex, rowIndex);
        const end = Math.max(this.itemIndex, rowIndex);
        this.internalSelected = this.internalRows.slice(start, end + 1);
      } else {
        // Change the item index
        this.internalItemIndex = rowIndex;
        // Select the row
        this.internalSelected = [selected];
      }
    },
    onRowDblClick(event, rowIndex) {
      // Emit the row double click event
      this.$emit("row:dblclick", event, rowIndex);
    },
    onListviewClick() {
      // Clear the selected items
      this.internalSelected = [];
      // Clear the item index
      this.internalItemIndex = -1;
      // Reset the editing cell
      this.resetEditingCell();
    },
    onListviewMouseWheel() {
      // Reset the editing cell
      this.resetEditingCell();
    },
    onColumnClick(event, columnIndex) {
      // Trigger click event on the document body
      document.body.click();
      // Prevent from bubbling up to the listview container
      event.stopPropagation();
      // Reset the editing cell
      this.resetEditingCell();
      // Emit the column click event
      this.$emit("column:click", columnIndex);
    },
    onColumnDblClick(event, columnIndex) {
      // Emit the column double click event
      this.$emit("column:dblclick", columnIndex);
    },
    onCellDblClick(event, rowIndex, columnIndex) {
      // Reset the editing cell
      this.resetEditingCell();
      // Set the item index
      this.internalItemIndex = rowIndex;
      // Emit the cell dblclick event
      this.$emit("cell:dblclick", event, rowIndex, columnIndex);
      // Is the edit on double click enabled?
      if (this.editOnDblClick) {
        // Change the editing cell
        this.editingCell = {
          rowIndex,
          columnIndex,
        };
        // Reset the item index
        this.internalItemIndex = -1;
        // Clear the selected items
        this.internalSelected = [];
        // Focus the input
        this.$nextTick(() => {
          if (
            this.$refs.input &&
            this.$refs.input[0] &&
            this.$refs.input[0].focus
          ) {
            this.$refs.input[0].focus();
            this.$refs.input[0].select();
          }
        });
      }
    },
    onCellInput(event, rowIndex, columnIndex) {
      // Prevent from bubbling up to the row
      event.stopPropagation();
      // Update the row item value
      this.internalRows[rowIndex][columnIndex] = String(event.target.value);
    },
    onOutsideEditClick(event) {
      // Prevent from bubbling up to the row
      event.stopPropagation();
      // Reset the editing cell
      this.resetEditingCell();
    },
    resetEditingCell() {
      // Reset the editing cell
      this.editingCell = {
        rowIndex: -1,
        columnIndex: -1,
      };
    },
    handleKeys(event) {
      event.stopPropagation();
      event.preventDefault();
      // Reset the editing cell
      this.resetEditingCell();
      if (
        event.key === "Up" ||
        event.key === "ArrowUp" ||
        event.key === "Left" ||
        event.key === "ArrowLeft"
      ) {
        // if the first row is selected, and the selected items are not empty, then clear the selected items
        if (
          this.internalItemIndex === 0 &&
          this.selected.length > 0 &&
          !event.shiftKey &&
          !event.ctrlKey
        ) {
          this.internalSelected = [];
        }
        // Is the first row selected?
        if (this.internalItemIndex > 0) {
          // Is the shift key pressed?
          if (event.shiftKey) {
            // Add the previous row item to the selected items
            this.internalSelected = [
              ...this.selected,
              this.internalRows[this.internalItemIndex - 1],
            ];
          } else {
            // Select the previous row item
            this.internalSelected = [
              this.internalRows[this.internalItemIndex - 1],
            ];
          }
          // Change the item index
          this.internalItemIndex = this.internalItemIndex - 1;
        }
      } else if (
        event.key === "Down" ||
        event.key === "ArrowDown" ||
        event.key === "Right" ||
        event.key === "ArrowRight"
      ) {
        // if the last row is selected, and the selected items are not empty, then clear the selected items
        if (
          this.internalItemIndex === this.internalRows.length - 1 &&
          this.selected.length > 0 &&
          !event.shiftKey &&
          !event.ctrlKey
        ) {
          this.internalSelected = [];
        }
        // Is the last row selected?
        if (this.internalItemIndex < this.internalRows.length - 1) {
          // Is the shift key pressed?
          if (event.shiftKey) {
            // Add the next row item to the selected items
            this.internalSelected = [
              ...this.selected,
              this.internalRows[this.internalItemIndex + 1],
            ];
          } else {
            // Select the next row item
            this.internalSelected = [
              this.internalRows[this.internalItemIndex + 1],
            ];
          }
          // Change the item index
          this.internalItemIndex = this.internalItemIndex + 1;
        }
      } else if (event.key === "Escape") {
        // Clear the selected items
        this.internalSelected = [];
        // Clear the item index
        this.$emit("itemIndex:change", -1);
      } else if ((event.key === "A" || event.key === "a") && event.ctrlKey) {
        // Select all the rows
        this.internalSelected = [...this.internalRows];
        // Change the item index
        this.internalItemIndex = this.internalRows.length - 1;
      } else if (event.key === "Home" || event.key === "End") {
        // Is the home key pressed?
        if (event.key === "Home") {
          // Select the first row
          this.internalSelected = [this.internalRows[0]];
          // Change the item index
          this.internalItemIndex = 0;
        } else {
          // Select the last row
          this.internalSelected = [
            this.internalRows[this.internalRows.length - 1],
          ];
          // Change the item index
          this.internalItemIndex = this.internalRows.length - 1;
        }
      }
    },
    handleEditKeys(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        // Store the row index
        const rowIndex = this.editingCell.rowIndex;
        // Close the editing cell
        this.resetEditingCell();
        // Select the row
        this.internalSelected = [this.internalRows[rowIndex]];
        // Change the item index
        this.internalItemIndex = rowIndex;
        // Focus the listview
        this.$refs.listview.focus();
      } else if (event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();
        // Is the shift key pressed?
        if (event.shiftKey) {
          // Change the editing cell if the column index is greater than 0
          if (this.editingCell.columnIndex > 0) {
            this.editingCell = {
              rowIndex: this.editingCell.rowIndex,
              columnIndex: this.editingCell.columnIndex - 1,
            };
            this.$nextTick(() => {
              if (this.$refs.input) {
                this.$refs.input[0].focus();
                this.$refs.input[0].select();
              }
            });
          }
        } else {
          // Change the editing cell if the column index is less than the number of columns
          if (this.editingCell.columnIndex < this.internalColumns.length - 1) {
            this.editingCell = {
              rowIndex: this.editingCell.rowIndex,
              columnIndex: this.editingCell.columnIndex + 1,
            };
            this.$nextTick(() => {
              if (this.$refs.input) {
                this.$refs.input[0].focus();
                this.$refs.input[0].select();
              }
            });
          }
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        // Reset the editing cell
        this.resetEditingCell();
      }
    },
    moveSelectedItemsUp() {
      // Check if there are selected items
      if (this.internalSelected.length === 0) {
        return;
      }

      // Sort the selected items based on their current index
      const sortedItems = this.internalSelected.sort((a, b) => {
        return this.internalRows.indexOf(a) - this.internalRows.indexOf(b);
      });

      // Move the selected items one position up
      const firstSelectedIndex = this.internalRows.indexOf(sortedItems[0]);
      if (firstSelectedIndex > 0) {
        const prevItem = this.internalRows[firstSelectedIndex - 1];
        this.internalRows.splice(firstSelectedIndex - 1, 0, ...sortedItems);
        sortedItems.forEach((item) => {
          const index = this.internalRows.indexOf(item);
          if (index > -1) {
            this.internalRows.splice(index + 1, 1);
          }
        });

        // Update the internal selected items and item index
        this.internalSelected = sortedItems;
        this.internalItemIndex = firstSelectedIndex - 1;
      }
    },
    moveSelectedItemsDown() {
      // Check if there are selected items
      if (this.internalSelected.length === 0) {
        return;
      }

      // Sort the selected items based on their current index in reverse order
      const sortedItems = this.internalSelected.sort((a, b) => {
        return this.internalRows.indexOf(b) - this.internalRows.indexOf(a);
      });

      // Move the selected items one position down
      const lastSelectedIndex = this.internalRows.indexOf(
        sortedItems[sortedItems.length - 1]
      );
      if (lastSelectedIndex < this.internalRows.length - 1) {
        const nextItem = this.internalRows[lastSelectedIndex + 1];
        this.internalRows.splice(lastSelectedIndex + 2, 0, ...sortedItems);
        sortedItems.forEach((item) => {
          const index = this.internalRows.indexOf(item);
          if (index > -1) {
            this.internalRows.splice(index, 1);
          }
        });

        // Update the internal selected items and item index
        this.internalSelected = sortedItems;
        this.internalItemIndex = lastSelectedIndex + 1;
      }
    },
    moveSelectedItemsToTop() {
      // Check if there are selected items
      if (this.internalSelected.length === 0) {
        return;
      }

      // Move the selected items to the top of the list
      const selectedItems = this.internalRows.filter((item) =>
        this.internalSelected.includes(item)
      );
      this.internalRows = selectedItems.concat(
        this.internalRows.filter(
          (item) => !this.internalSelected.includes(item)
        )
      );

      // Update the internal selected items and item index
      this.internalSelected = selectedItems;
      this.internalItemIndex = 0;
    },
    moveSelectedItemsToBottom() {
      // Check if there are selected items
      if (this.internalSelected.length === 0) {
        return;
      }

      // Move the selected items to the bottom of the list
      const selectedItems = this.internalRows.filter((item) =>
        this.internalSelected.includes(item)
      );
      this.internalRows = this.internalRows
        .filter((item) => !this.internalSelected.includes(item))
        .concat(selectedItems);

      // Update the internal selected items and item index
      this.internalSelected = selectedItems;
      this.internalItemIndex = this.internalRows.length - selectedItems.length;
    },
  },
  watch: {
    focused(value) {
      if (value) {
        window.addEventListener("keydown", this.handleKeys);
      } else {
        window.removeEventListener("keydown", this.handleKeys);
      }
    },
    editingCell: {
      handler(value) {
        if (value.rowIndex > -1 && value.columnIndex > -1) {
          window.addEventListener("click", this.onOutsideEditClick);
          window.addEventListener("keydown", this.handleEditKeys);
        } else {
          window.removeEventListener("click", this.onOutsideEditClick);
          window.removeEventListener("keydown", this.handleEditKeys);
        }
      },
      deep: true,
    },
    internalColumns(newColumns) {
      this.$emit("update:columns", newColumns);
    },
    columns(newColumns) {
      this.internalColumns = newColumns;
    },
    internalRows(newRows) {
      this.$emit("update:rows", newRows);
    },
    rows(newRows) {
      this.internalRows = newRows;
    },
    internalItemIndex(newIndex) {
      this.$emit("update:itemIndex", newIndex);
    },
    itemIndex(newIndex) {
      this.internalItemIndex = newIndex;
    },
    internalSelected(newSelected) {
      this.$emit("update:selected", newSelected);
    },
    selected(newSelected) {
      this.internalSelected = newSelected;
    },
  },
};
</script>

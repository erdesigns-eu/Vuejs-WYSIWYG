<template>
  <div class="home-view">
    <list-view
      v-model:columns="ListView.columns"
      v-model:rows="listviewRows"
      v-model:item-index="ListView.itemIndex"
      v-model:selected="ListView.selected"
      keep-selected
      striped
      draggable
      edit-on-dbl-click
    ></list-view>
  </div>
</template>

<script>
import InputBox from "@/components/Control/InputBox.vue";
import SelectBox from "@/components/Control/SelectBox.vue";
import CheckBox from "@/components/Control/CheckBox.vue";
import TextButton from "@/components/Control/TextButton.vue";
import ListView from "@/components/Control/ListView.vue";

export default {
  name: "HomeView",
  components: {
    InputBox,
    SelectBox,
    CheckBox,
    TextButton,
    ListView,
  },
  data() {
    return {
      inputValue: "Hello World",
      selectValue: 0,
      checkedValue: false,
      options: [
        {
          label: "Option 1",
          value: "option1",
          description:
            "This is option 1 and this description is very long. It should wrap to multiple lines.",
        },
        {
          label: "Option 2",
          value: "option2",
          description: "This is option 2",
        },
        {
          label: "Option 3",
          value: "option3",
          description: "This is option 3",
        },
        {
          label: "Option 4",
          value: "option4",
          description: "This is option 4",
        },
        {
          label: "Option 5",
          value: "option5",
          description: "This is option 5",
        },
        {
          label: "Option 6",
          value: "option6",
          description: "This is option 6",
        },
        {
          label: "Option 7",
          value: "option7",
          description: "This is option 7",
        },
        {
          label: "Option 8",
          value: "option8",
          description: "This is option 8",
        },
        {
          label: "Option 9",
          value: "option9",
          description: "This is option 9",
        },
        {
          label: "Option 10",
          value: "option10",
          description: "This is option 10",
        },
      ],
      ListView: {
        itemIndex: -1,
        selected: [],
        columns: [
          {
            label: "Column 1",
            width: 200,
            align: "left",
          },
          {
            label: "Column 2",
            width: 100,
            align: "left",
          },
          {
            label: "Column 3",
            width: 100,
            align: "left",
          },
          {
            label: "Column 4",
            width: 100,
            align: "left",
          },
          {
            label: "Column 5",
            width: 100,
            align: "left",
          },
          {
            label: "Column 6",
            width: 100,
            align: "left",
          },
          {
            label: "Column 7",
            width: 100,
            align: "left",
          },
          {
            label: "Column 8",
            width: 100,
            align: "left",
          },
          {
            label: "Column 9",
            width: 100,
            align: "left",
          },
          {
            label: "Column 10",
            width: 100,
            align: "left",
          },
        ],
        rows: [],
      },
    };
  },
  computed: {
    listviewRows() {
      const rows = [];
      for (let i = 1; i <= 100; i++) {
        const row = [
          `R ${i} C 1`,
          `R ${i} C 2`,
          `R ${i} C 3`,
          `R ${i} C 4`,
          `R ${i} C 5`,
          `R ${i} C 6`,
          `R ${i} C 7`,
          `R ${i} C 8`,
          `R ${i} C 9`,
          `R ${i} C 10`,
        ];
        rows.push(row);
      }
      return rows;
    },
  },
  methods: {
    onRowsChange(rows) {
      this.ListView.rows = rows;
    },
  },
};
</script>

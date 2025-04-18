<template>
  <div id="app">
    <vue-el-cascader
      v-model="value"
      :props="props"
      filterable
      customSuggestion
      collapse-tags
      :show-all-levels="false"
      @menu-scroll-bottom="handleScrollBottom"
      @suggestion-scroll-bottom="handleSuggestionScrollBottom"
    >
      <template v-slot:search="{ node, inputValue }">
        <highlight :inputValue="inputValue" :text="node.text"></highlight>
      </template>
    </vue-el-cascader>
  </div>
</template>

<script>
import highlight from "../packages/cascader/src/highlight.vue";
import { getData, searchData, rootData } from "./data";

export default {
  components: { highlight },

  name: "App",
  data() {
    return {
      // Your data properties go here
      value: ["1-1", "2-16"],
      props: {
        lazy: true,
        multiple: true,
        emitPath: false,
        lazyLoad(node, resolve) {
          const { level, root, isLeaf, data: nodeData } = node;
          if (isLeaf) return resolve([]);
          setTimeout(() => {
            // 加载根节点
            if (root) {
              console.log("lazyload root");
              resolve(rootData);
            } else {
              // 加载叶子节点
              console.log("lazyload", level);
              const { value: parentId } = nodeData;
              nodeData.currentPage = 1;
              nodeData.isEnd = false;
              const { data: children, total } = getData(
                parentId,
                nodeData.currentPage,
                10
              );
              if (node.children.length + children.length < total) {
                nodeData.isEnd = false;
              } else {
                nodeData.isEnd = true;
              }
              resolve(children);
            }
          }, 200);
        },
        remoteMethod: this.remoteMethod,
      },
      searchCurrentPage: 0,
      // 维护一个根节点对象
      rootNodeData: {
        label: "",
        value: "",
        total: 300, //可更改
        children: [],
      },
    };
  },
  methods: {
    remoteMethod(query, resolve) {
      console.log("query", query);
      if (query !== "") {
        this.searchCurrentPage = 1;
        // this.loading = true;
        setTimeout(() => {
          // this.loading = false;
          const res = searchData(query, this.searchCurrentPage, 10);
          resolve(res.data);
        }, 2000);
      }
    },
    handleScrollBottom(parentNode, resolve) {
      if (parentNode) {
        const { data: nodeData } = parentNode;
        const { isEnd, value, total } = nodeData;
        // if (isEnd) return
        nodeData.currentPage = nodeData.currentPage || 0;
        nodeData.currentPage++;
        setTimeout(() => {
          const { data: children, total } = getData(
            value,
            parentNode.data.currentPage,
            5
          );
          nodeData.total = total;
          if (parentNode.children.length + children.length < total) {
            nodeData.isEnd = false;
          } else {
            nodeData.isEnd = true;
          }
          resolve(children);
        }, 200);
      } else {
        this.rootNodeData.currentPage = this.rootNodeData.currentPage || 0;
        this.rootNodeData.currentPage++;
        setTimeout(() => {
          const { data: children, total } = getData(
            0,
            this.rootNodeData.currentPage,
            10
          );
          this.rootNodeData.total = total;
          if (this.rootNodeData.children.length + children.length < total) {
            this.rootNodeData.isEnd = false;
          } else {
            this.rootNodeData.isEnd = true;
          }
          resolve(children);
        }, 200);
      }
    },
    handleSuggestionScrollBottom(query, resolve) {
      if (query !== "") {
        this.searchCurrentPage++;
        setTimeout(() => {
          const { data, total } = searchData(query, this.searchCurrentPage, 10);
          resolve(data);
        }, 1000);
      }
    },
  },
};
</script>

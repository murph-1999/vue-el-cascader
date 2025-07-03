<template>
  <div id="app">
    <vue-el-cascader
      v-model="value"
      :props="props"
      remote
      filterable
      collapse-tags
      :show-all-levels="false"
      @menu-scroll-bottom="handleScrollBottom"
      @suggestion-scroll-bottom="handleSuggestionScrollBottom"
    >
    </vue-el-cascader>
  </div>
</template>

<script>
import { getData, searchData, PAGE_SIZE } from "./data";

export default {
  components: {},

  name: "App",
  data() {
    const _this = this;
    return {
      value: ["1-1", "2-16"], //初始被选中的数据
      props: {
        lazy: true,
        multiple: true,
        emitPath: false,
        pagination: true, // 开启滚动加载
        virtualScroll: false, //开启虚拟列表
        // 动态加载
        async lazyLoad(node, resolve) {
          const { isLeaf } = node;
          if (isLeaf) return resolve([]);

          const isRoot = node.root;
          setTimeout(async () => {
            const { children } = _this.onLoadData(node, isRoot, 1);
            resolve(children);
          }, 200);
        },
        remoteMethod: this.remoteMethod,
      },
      searchCurrentPage: 0,
      // 维护一个根节点对象
      rootNodeData: {
        label: "",
        value: "",
        children: [],
        currentPage: 0,
        isEnd: false,
        total: 0,
      },
    };
  },
  methods: {
    onLoadData(node, isRoot, page) {
      const nodeData = isRoot ? this.rootNodeData : node.data;
      if (nodeData.isEnd) return { children: [] };

      const parentId = isRoot ? null : nodeData.value;
      if (page) {
        nodeData.currentPage = page;
      } else {
        nodeData.currentPage++;
      }
      const { data: children, total } = getData(
        parentId,
        nodeData.currentPage,
        PAGE_SIZE
      );

      // 更新结束标志
      const currentTotal = isRoot
        ? nodeData.children.length
        : node.children.length;
      nodeData.isEnd = currentTotal + children.length >= total;
      nodeData.total = total;
      if (isRoot) {
        nodeData.children = nodeData.children.concat(children);
      }
      return { children };
    },
    // 滚动加载更多
    handleScrollBottom(node, resolve) {
      const isRoot = !node;
      setTimeout(() => {
        const { children } = this.onLoadData(node, isRoot);
        resolve(children);
      }, 200);
    },
    handleSuggestionScrollBottom(query, resolve) {
      if (query !== "") {
        this.searchCurrentPage++;
        setTimeout(() => {
          const { data, total } = searchData(
            query,
            this.searchCurrentPage,
            PAGE_SIZE
          );
          resolve(data);
        }, 200);
      }
    },
    remoteMethod(query, resolve) {
      console.log("query", query);
      if (query !== "") {
        this.searchCurrentPage = 1;
        setTimeout(() => {
          const res = searchData(query, this.searchCurrentPage, PAGE_SIZE);
          resolve(res.data);
        }, 0);
      }
    },
  },
};
</script>

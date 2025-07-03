<script>
import ElScrollbar from "element-ui/packages/scrollbar";
import CascaderNode from "./cascader-node.vue";
import Locale from "element-ui/src/mixins/locale";
import { generateId, isEmpty } from "element-ui/src/utils/util";
import virtualListItem from "./cascader-virtual-scroll-item.vue";
import VirtualList from "vue-virtual-scroll-list";
import emitter from "element-ui/src/mixins/emitter";

export default {
  name: "ElCascaderMenu",

  mixins: [Locale, emitter],

  inject: ["panel"],

  components: {
    ElScrollbar,
    CascaderNode,
    "virtual-list": VirtualList,
  },

  props: {
    nodes: {
      type: Array,
      required: true,
    },
    index: Number,
  },
  watch: {
    nodes() {
      this.isCheckAll && this.updateInDeterminate();
    },
    menuId(val) {
      this.virtualListProps.menuId = val;
    },
  },
  data() {
    return {
      activeNode: null,
      hoverTimer: null,
      id: generateId(),
      virtualListProps: {},
      checkAll: false,
      isIndeterminate: false,
    };
  },

  computed: {
    isEmpty() {
      return !this.nodes.length;
    },
    menuId() {
      return `cascader-menu-${this.id}-${this.index}`;
    },
    isCheckAll() {
      let config = this.panel.config;
      return (
        config.checkAll &&
        (config.checkStrictly || (!config.checkStrictly && this.index === 0))
      );
    },
  },
  created() {
    if (this.isCheckAll) {
      this.updateInDeterminate();
      this.$on("updateInDeterminate", this.updateInDeterminate);
    }
  },
  methods: {
    updateInDeterminate() {
      const { panel, nodes } = this;
      if (panel.config.checkAll) {
        let counter = 0;
        let disabledCounter = 0;
        let indeterminateCounter = 0;
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if (!node.isDisabled) {
            node.checked && counter++;
            node.indeterminate && indeterminateCounter++;
          } else {
            disabledCounter++;
          }
        }
        this.checkAll =
          counter === this.nodes.length - disabledCounter && counter > 0;
        this.isIndeterminate = this.checkAll
          ? false
          : indeterminateCounter > 0 || counter > 0;
      }
    },
    handleCheckAllChange() {
      const { nodes, panel } = this;
      this.checkAll = !this.checkAll;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.doCheck(this.checkAll, true);
      }
      panel.calculateMultiCheckedValue();
    },
    handleExpand(e) {
      this.activeNode = e.target;
    },
    handleMouseMove(e) {
      const { activeNode, hoverTimer } = this;
      const { hoverZone } = this.$refs;

      if (!activeNode || !hoverZone) return;

      if (activeNode.contains(e.target)) {
        clearTimeout(hoverTimer);

        const { left } = this.$el.getBoundingClientRect();
        const startX = e.clientX - left;
        const { offsetWidth, offsetHeight } = this.$el;
        const top = activeNode.offsetTop;
        const bottom = top + activeNode.offsetHeight;

        hoverZone.innerHTML = `
          <path style="pointer-events: auto;" fill="transparent" d="M${startX} ${top} L${offsetWidth} 0 V${top} Z" />
          <path style="pointer-events: auto;" fill="transparent" d="M${startX} ${bottom} L${offsetWidth} ${offsetHeight} V${bottom} Z" />
        `;
      } else if (!hoverTimer) {
        this.hoverTimer = setTimeout(
          this.clearHoverZone,
          this.panel.config.hoverThreshold
        );
      }
    },
    clearHoverZone() {
      const { hoverZone } = this.$refs;
      if (!hoverZone) return;
      hoverZone.innerHTML = "";
    },

    renderEmptyText(h) {
      return (
        <div class="el-cascader-menu__empty-text">
          {this.t("el.cascader.noData")}
        </div>
      );
    },
    renderNodeList(h) {
      const {
        menuId,
        nodes,
        checkAll,
        isIndeterminate,
        handleCheckAllChange,
        isCheckAll,
      } = this;
      const { isHoverMenu, config } = this.panel;
      const events = { on: {} };

      if (isHoverMenu) {
        events.on.expand = this.handleExpand;
      }

      this.virtualListProps.menuId = menuId;
      const nodeItems = nodes.map((node, index) => {
        const { hasChildren } = node;
        return (
          <cascader-node
            key={node.uid}
            node={node}
            node-id={`${menuId}-${index}`}
            aria-haspopup={hasChildren}
            aria-owns={hasChildren ? menuId : null}
            {...events}
          ></cascader-node>
        );
      });

      return [
        isCheckAll && (
          <el-checkbox
            class="checkall"
            indeterminate={isIndeterminate}
            value={checkAll}
            onChange={handleCheckAllChange}
          >
            全选
          </el-checkbox>
        ),
        config.virtualScroll ? (
          <virtual-list
            style={{ height: "200px", overflowY: "auto" }}
            ref="virtualList"
            class="el-cascader-menu__virtual-list"
            data-key="uid"
            data-sources={nodes}
            extra-props={this.virtualListProps}
            data-component={virtualListItem}
          ></virtual-list>
        ) : (
          [...nodeItems]
        ),
        isHoverMenu ? (
          <svg ref="hoverZone" class="el-cascader-menu__hover-zone"></svg>
        ) : null,
      ];
    },
    /**
     * @author Murphy
     * listen for rolling bottom
     */
    bindScrollbarListener() {
      this.$nextTick(() => {
        const { config } = this.panel;
        const refName = "scrollbar";
        if (this.$refs[refName].override) {
          return;
        }

        let scrollTimer = null;
        let isLoading = false; // 添加加载标志位
        const THRESHOLD = 10; // 设置10px的阈值
        const DEBOUNCE_DELAY = 300; // 200ms的防抖延迟

        this.$refs[refName].handleScroll = () => {
          const wrap = this.$refs[refName].wrap;
          this.$refs[refName].moveY =
            (wrap.scrollTop * 100) / wrap.clientHeight;
          this.$refs[refName].moveX =
            (wrap.scrollLeft * 100) / wrap.clientWidth;

          // 计算到底部的距离
          const scrollBottom =
            wrap.scrollHeight - wrap.scrollTop - wrap.clientHeight;

          if (scrollBottom <= THRESHOLD && !isLoading) {
            // 清除之前的定时器
            if (scrollTimer) {
              clearTimeout(scrollTimer);
            }

            // 添加防抖
            scrollTimer = setTimeout(() => {
              isLoading = true; // 开始加载，设置标志位
              let parentNode = this.nodes[0] && this.nodes[0].parent;
              const resolve = (data) => {
                // 无数据
                if (isEmpty(data)) {
                  isLoading = false; // 重置加载状态
                  return;
                }

                // append当前父节点中不存在的节点到menu中
                let loadedVals,
                  toAppendData = [];
                // 第一层节点
                if (!parentNode) {
                  loadedVals = this.nodes.map((n) => n.getValue());
                } else {
                  loadedVals = parentNode.children.map((n) => n.getValue());
                }
                toAppendData = data.filter(
                  (d) => !loadedVals.includes(d[this.panel.config.value])
                );
                if (!toAppendData.length) {
                  isLoading = false; // 重置加载状态
                  return;
                }
                // 计算一次展示值
                this.$parent.$parent.computePresentContent();
                toAppendData.forEach((d) => {
                  this.panel.store.appendNode(d, parentNode);
                });
                // 同步checkedValue到节点checked
                this.panel.syncMultiCheckState();
                // 加载完成，重置状态
                isLoading = false;
              };
              this.$emit("menu-scroll-bottom", parentNode, resolve);
            }, DEBOUNCE_DELAY);
          }
        };
        this.$refs[refName].override = true;
      });
    },
  },

  mounted() {
    const { config } = this.panel;
    if (config.pagination) {
      this.bindScrollbarListener();
    }
  },

  render(h) {
    const { isEmpty, menuId } = this;
    const events = { nativeOn: {} };
    const { config } = this.panel;

    // optimize hover to expand experience (#8010)
    if (this.panel.isHoverMenu) {
      events.nativeOn.mousemove = this.handleMouseMove;
      // events.nativeOn.mouseleave = this.clearHoverZone;
    }

    return config.virtualScroll ? (
      <div class="el-cascader-menu" style={{ position: "relative" }}>
        {isEmpty ? this.renderEmptyText(h) : this.renderNodeList(h)}
      </div>
    ) : (
      <el-scrollbar
        ref="scrollbar"
        tag="ul"
        role="menu"
        id={menuId}
        class="el-cascader-menu"
        wrap-class="el-cascader-menu__wrap"
        view-class={{
          "el-cascader-menu__list": true,
          "is-empty": isEmpty,
        }}
        {...events}
      >
        {isEmpty ? this.renderEmptyText(h) : this.renderNodeList(h)}
      </el-scrollbar>
    );
  },
};
</script>

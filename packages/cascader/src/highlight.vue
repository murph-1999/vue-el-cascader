<!--
 * @Description:
 * @version:
 * @Author: Murphy
 * @Date: 2024-10-11 16:39:25
 * @LastEditTime: 2024-10-11 16:39:43
-->
<template>
  <span>
    <template v-for="(item, index) in highlightedText">
      <span v-if="item.highlight" :key="index" class="highlighted">{{ item.text }}</span>
      <span v-else :key="index">{{ item.text }}</span>
    </template>
  </span>
</template>

<script>
export default {
  name: 'Highlight',
  props: {
    text: {
      type: String,
      required: true
    },
    inputValue: {
      type: String,
      required: true
    }
  },
  computed: {
    highlightedText() {
      if (!this.inputValue) {
        return [{ text: this.text, highlight: false }];
      }

      const regex = new RegExp(this.escapeRegExp(this.inputValue), 'gi');
      const parts = this.text.split(regex);
      const matches = this.text.match(regex);

      const result = [];
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
          result.push({ text: parts[i], highlight: false });
        }
        if (matches && matches[i]) {
          result.push({ text: matches[i], highlight: true });
        }
      }

      return result;
    }
  },
  methods: {
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }
};
</script>

<style scoped>
.highlighted {
  font-weight: bold;
  color: #409EFF;
}
</style>

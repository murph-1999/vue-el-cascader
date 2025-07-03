<!--
 * @Description:
 * @version:
 * @Author: Murphy
 * @Date: 2024-10-10 16:14:59
 * @LastEditTime: 2025-07-03 16:57:08
-->
# vue-el-cascader
## Description
基于`element-ui`的`cascader`组件进行扩展，新增特征包括自定义搜索节点，高亮匹配文本，滚动加载，远程搜索、虚拟列表。

## Task
- [x] 自定义搜索节点
- [x] 高亮匹配文本
- [x] 滚动加载
- [x] 远程搜索
- [x] 虚拟列表
## 新增props
### Cascader Attributes
| 参数   | 说明         | 类型    |
| ------ | ------------ | ------- |
| remote | 支持远程搜索 | Boolean |
### props
| 参数          | 说明                                                         | 类型                     |
| ------------- | ------------------------------------------------------------ | ------------------------ |
| pagination    | 支持分页                                                     | Boolean                  |
| virtualScroll | 支持虚拟滚动                                                 | Boolean                  |
| remoteMethod  | 远程搜索，第一个参数是搜索关键词，第二个是数据搜索到后的回调 | function(query, resolve) |
## 新增events
| 事件名称                 | 说明                                             | 回调参数                                                   |
| ------------------------ | ------------------------------------------------ | ---------------------------------------------------------- |
| menu-scroll-bottom       | menu滚动到底部触发，和属性pagination配合使用     | 第一个参数是当前面板的父节点，第二个参数是数据加载后的回调 |
| suggestion-scroll-bottom | 建议面板滚动到底部触发，和属性pagination配合使用 | 第一个参数是搜索关键词，第二个是数据搜索到后的回调         |
## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Builds for package, then publish
```
npm run lib
```
### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

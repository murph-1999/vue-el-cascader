/*
 * @Description:
 * @version:
 * @Author: Murphy
 * @Date: 2024-10-10 16:14:57
 * @LastEditTime: 2024-10-11 10:05:59
 */
const {
  defineConfig
} = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'examples/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  }
})
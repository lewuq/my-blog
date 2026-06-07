import { getSubCategories, getDirectPosts } from '../../../../.vitepress/posts.mjs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const dir = dirname(fileURLToPath(import.meta.url))

export default {
  load() {
    return {
      subCats: getSubCategories(dir, '/posts/linux/kernel/imx6ull'),
      posts: getDirectPosts(dir, '/posts/linux/kernel/imx6ull'),
    }
  },
}

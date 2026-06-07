import { getCategoryNav } from './.vitepress/posts.mjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const postsDir = join(dirname(fileURLToPath(import.meta.url)), 'posts')

export default {
  load() {
    return {
      categories: getCategoryNav(postsDir),
    }
  },
}

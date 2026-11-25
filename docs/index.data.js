import { getCategoryNav, getPosts } from './.vitepress/posts.mjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const postsDir = join(dirname(fileURLToPath(import.meta.url)), 'posts')

export default {
  watch: ['./posts/**/*.md'],
  load() {
    return { categories: getCategoryNav(postsDir), posts: getPosts(postsDir, '/posts') }
  },
}

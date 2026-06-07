import { getDirectPosts } from '../../../.vitepress/posts.mjs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const dir = dirname(fileURLToPath(import.meta.url))

export default {
  load() {
    return {
      posts: getDirectPosts(dir, '/posts/mcu/esp32'),
    }
  },
}

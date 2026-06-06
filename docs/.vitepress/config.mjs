import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { generateSidebar } from './posts.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const postsDir = join(__dirname, '..', 'posts')

export default defineConfig({
  base: '/my-blog/',
  title: "Zeller's Blog",
  description: "个人技术博客",

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts' },
    ],

    sidebar: {
      '/posts': generateSidebar(postsDir),
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/lewuq' }
    ]
  }
})
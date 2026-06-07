/*
 * @Author: zeller030 zeller030@gmail.com
 * @Date: 2026-06-07 14:27:53
 * @LastEditors: zeller030 zeller030@gmail.com
 * @LastEditTime: 2026-06-07 14:35:53
 * @FilePath: \my-blog\docs\.vitepress\config.mjs
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { generateSidebar, getCategoryNav } from './posts.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const postsDir = join(__dirname, '..', 'posts')

export default defineConfig({
  base: '/my-blog/',
  title: "Zeller's Blog",
  description: '个人技术博客',

  head: [
    ['link', { rel: 'icon', href: '/my-blog/favicon.ico' }],
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: 'Learn',
        items: getCategoryNav(postsDir),
      },
      {
        text: 'Contact',
        items: [
          { text: '📧 Email', link: 'mailto:le_wuq@163.com' },
          { text: '📺 B站', link: 'https://space.bilibili.com/your-id' },
          { text: '✈️ TG', link: 'https://t.me/your-telegram' },
        ],
      },
    ],

    sidebar: {
      '/posts': generateSidebar(postsDir, '/posts', { collapsed: true }),
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/lewuq' },
    ],

    footer: {
      message: 'Powered by VitePress',
      copyright: 'Copyright © 2026 Zeller',
    },

    search: {
      provider: 'local',
    },
  },
})

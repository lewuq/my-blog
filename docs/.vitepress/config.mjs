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
  lang: 'zh-CN',
  lastUpdated: false,
  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/my-blog/logo.svg' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    outline: { level: [2, 3], label: '本页目录' },
    sidebarMenuLabel: '文章目录',
    darkModeSwitchLabel: '日夜配色',
    lightModeSwitchTitle: '切换到柔和白天',
    darkModeSwitchTitle: '切换到鼠尾草绿夜晚',
    returnToTopLabel: '回到顶部',
    docFooter: { prev: '上一篇', next: '下一篇' },
    nav: [
      { text: '首页', link: '/' },
      { text: '全部文章', link: '/posts', activeMatch: '^/posts$' },
      {
        text: '学习笔记',
        items: getCategoryNav(postsDir),
      },
      {
        text: '联系我',
        items: [
          { text: '邮件', link: 'mailto:le_wuq@163.com' },
          { text: 'GitHub', link: 'https://github.com/lewuq' },
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
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索笔记', buttonAriaLabel: '搜索笔记' },
              modal: {
                displayDetails: '显示详情', resetButtonTitle: '清除搜索',
                backButtonTitle: '返回', noResultsText: '没有找到相关笔记',
                footer: { selectText: '选择', selectKeyAriaLabel: '回车', navigateText: '切换', navigateUpKeyAriaLabel: '向上', navigateDownKeyAriaLabel: '向下', closeText: '关闭', closeKeyAriaLabel: '退出' },
              },
            },
          },
        },
      },
    },
  },
})

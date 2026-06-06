import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/my-blog/',
  title: "Zeller's Blog",
  description: "个人技术博客",

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
    ],

    sidebar: {
      '/posts/': [
        {
          text: 'MCU',
          items: [
            {
              text: 'ESP32',
              items: [
                { text: 'ESP32-S3 三子棋', link: '/posts/mcu/esp32/esp32-chess' },
                { text: 'ESP32 步进电机', link: '/posts/mcu/esp32/esp32-stepper' },
              ]
            }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/lewuq' }
    ]
  }
})
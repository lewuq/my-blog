<script setup>
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
const { page, frontmatter } = useData()
const names = { mcu: 'MCU', linux: 'Linux', essay: '随笔', esp32: 'ESP32', nordic: 'Nordic', 'linux-bare-metal': '裸机开发', imx6ull: 'i.MX6ULL', kernel: '内核', rootfs: '根文件系统', uboot: 'U-Boot', homeassistant: 'Home Assistant', matter: 'Matter', network: '网络', '3d_model': '3D 建模' }
const parts = computed(() => page.value.relativePath.replace(/\.md$/, '').split('/').slice(0, -1))
const crumbs = computed(() => parts.value.filter(part => part !== 'posts').map((part, index) => ({ label: names[part] || part, url: '/posts/' + parts.value.slice(1, index + 2).join('/') + '/' })))
const isCategory = computed(() => page.value.relativePath.endsWith('/index.md'))
</script>

<template>
  <header class="doc-header">
    <nav class="doc-breadcrumbs" aria-label="面包屑"><a :href="withBase('/posts')">全部文章</a><template v-for="crumb in crumbs" :key="crumb.url"><span aria-hidden="true">/</span><a :href="withBase(crumb.url)">{{ crumb.label }}</a></template></nav>
    <p class="eyebrow">{{ isCategory ? 'EXPLORE THE TOPIC' : 'LEARNING NOTES' }}</p><h1 class="doc-title">{{ page.title }}</h1>
    <p class="doc-description">{{ frontmatter.description || (isCategory ? '从这里开始，循着笔记一步步深入。' : '在实践中理解，在记录中积累。') }}</p>
  </header>
</template>

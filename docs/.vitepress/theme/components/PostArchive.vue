<script setup>
import { computed, ref } from 'vue'
import PostCard from './PostCard.vue'
const props = defineProps({ posts: { type: Array, default: () => [] }, categories: { type: Array, default: () => [] } })
const selected = ref('all')
const query = ref('')
const slug = category => category.link.split('/').filter(Boolean).at(-1)
const filtered = computed(() => {
  const value = query.value.trim().toLocaleLowerCase()
  return props.posts.filter(post => (selected.value === 'all' || post.category === selected.value) && (!value || `${post.title} ${post.summary} ${post.topic} ${post.categoryLabel}`.toLocaleLowerCase().includes(value)))
})
function reset() { selected.value = 'all'; query.value = '' }
</script>

<template>
  <main class="post-archive">
    <header class="archive-header"><p class="eyebrow">THE NOTEBOOK</p><h1>学习的痕迹，都在这里。</h1><p>关于嵌入式、Linux 和日常折腾的 {{ posts.length }} 篇记录。</p></header>
    <div class="archive-toolbar">
      <div class="archive-filters" role="group" aria-label="按主题筛选"><button :class="{ active: selected === 'all' }" :aria-pressed="selected === 'all'" @click="selected = 'all'">全部 <span>{{ posts.length }}</span></button><button v-for="category in categories" :key="category.link" :class="{ active: selected === slug(category) }" :aria-pressed="selected === slug(category)" @click="selected = slug(category)">{{ category.text }} <span>{{ posts.filter(post => post.category === slug(category)).length }}</span></button></div>
      <label class="archive-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input v-model="query" type="search" aria-label="搜索文章" placeholder="找一篇笔记…"></label>
    </div>
    <p class="archive-count" role="status" aria-live="polite">{{ filtered.length }} 篇笔记<span v-if="query.trim()"> · 搜索“{{ query.trim() }}”</span></p>
    <div v-if="filtered.length" class="archive-grid"><PostCard v-for="post in filtered" :key="post.url" :post="post" /></div>
    <div v-else class="archive-empty"><h2>还没有找到这篇笔记</h2><p>试试其他关键词，或回到全部文章。</p><button class="primary-link" @click="reset">查看全部文章</button></div>
  </main>
</template>

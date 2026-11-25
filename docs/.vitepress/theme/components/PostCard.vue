<script setup>
import { withBase } from 'vitepress'
defineProps({ post: { type: Object, required: true } })
</script>

<template>
  <a class="note-card" :href="withBase(post.url)">
    <div class="note-meta"><span class="note-category">{{ post.categoryLabel }}</span><span>{{ post.topic }} · {{ post.readingMinutes }} 分钟阅读</span></div>
    <h3>{{ post.title }}</h3>
    <p>{{ post.summary }}</p>
    <span class="note-read">阅读全文 <span aria-hidden="true">↗</span></span>
  </a>
</template>

---
title: Matter
---

<script setup>
import { data } from './index.data.js'
import { withBase } from 'vitepress'
</script>

<ul class="post-list">
  <li v-for="p in data.posts" :key="p.url">
    <a :href="withBase(p.url)">{{ p.title }}</a>
  </li>
</ul>

<div v-if="data.posts.length === 0" style="text-align:center;padding:60px 0;color:var(--vp-c-text-2)">
  暂无文章
</div>

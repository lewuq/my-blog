---
title: "imx6ull"
---

<script setup>
import { data } from './index.data.js'
import { withBase } from 'vitepress'
</script>

<div class="category-grid">
  <a v-for="c in data.subCats" :key="c.link" :href="withBase(c.link)" class="category-card">
    <h3>{{ c.text }}</h3>
  </a>
</div>

<div v-if="data.posts.length > 0" style="margin-top:32px">
  <h3>文章</h3>
  <ul class="post-list">
    <li v-for="p in data.posts" :key="p.url">
      <a :href="withBase(p.url)">{{ p.title }}</a>
    </li>
  </ul>
</div>

<div v-if="data.subCats.length === 0 && data.posts.length === 0" style="text-align:center;padding:60px 0;color:var(--vp-c-text-2)">
  暂无文章
</div>

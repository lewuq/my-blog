---
title: 文章
---

<script setup>
import { data } from './posts.data.js'
</script>

<ul>
  <li v-for="post in data.posts" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
  </li>
</ul>

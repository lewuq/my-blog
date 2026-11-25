---
layout: home
title: 首页
description: Zeller 的数字花园，记录嵌入式开发、Linux 学习与日常实践。
---

<script setup>
import { data } from './index.data.js'
</script>

<BlogHome :posts="data.posts" :categories="data.categories" />

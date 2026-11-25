<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import PostCard from './PostCard.vue'
const props = defineProps({ posts: { type: Array, default: () => [] }, categories: { type: Array, default: () => [] } })
const descriptions = {
  mcu: { name: '微控制器', subtitle: 'MCU & EMBEDDED', text: '从点亮一颗 LED，到让想法落地。', icon: 'chip' },
  linux: { name: 'Linux 系统', subtitle: 'LINUX & SYSTEMS', text: '从裸机、驱动到内核，一层层理解系统。', icon: 'layers' },
  essay: { name: '折腾与随笔', subtitle: 'PROJECTS & NOTES', text: '智能家居、实用工具，还有沿途的思考。', icon: 'book' },
}
const featured = computed(() => {
  const picks = ['esp32-chess', 'bare-idx', 'ha-matter']
  const selected = picks.map(slug => props.posts.find(p => p.url.endsWith('/' + slug))).filter(Boolean)
  return [...selected, ...props.posts.filter(p => !selected.includes(p))].slice(0, 3)
})
const count = category => props.posts.filter(post => post.category === category).length
const slug = category => category.link.split('/').filter(Boolean).at(-1)
</script>

<template>
  <div class="blog-home">
    <section class="home-intro" aria-labelledby="intro-title">
      <div class="intro-copy">
        <p class="eyebrow"><span></span> ZELLER'S DIGITAL GARDEN</p>
        <h1 id="intro-title">初心高于胜负<span>成长胜于输赢<span class="intro-period">。</span></span></h1>
        <p class="intro-description">你好，我是 Zeller。<br>在这里记录嵌入式开发、Linux 学习，<br class="desktop-break">以及把想法变成现实的每一次尝试。</p>
        <div class="intro-actions"><a class="primary-link" :href="withBase('/posts')">浏览全部文章</a><a class="quiet-link" href="https://github.com/lewuq" target="_blank" rel="noreferrer">在 GitHub 找到我 <span aria-hidden="true">↗</span></a></div>
        <div class="intro-footnote"><span>{{ posts.length }} 篇学习笔记</span><i></i><span>持续学习，慢慢生长</span></div>
      </div>
      <aside class="garden-note" aria-label="博客介绍">
        <div class="garden-note-top"><span>FIELD NOTES</span><span>学习 · 实践 · 记录</span></div>
        <div class="garden-art" aria-hidden="true">
          <svg viewBox="0 0 360 220" fill="none">
            <path class="art-grid" d="M0 45H360M0 90H360M0 135H360M0 180H360M45 0V220M90 0V220M135 0V220M180 0V220M225 0V220M270 0V220M315 0V220"/>
            <ellipse class="art-halo" cx="180" cy="116" rx="93" ry="84"/>
            <path class="art-trace" d="M144 138H94V168H51M215 140H260V176H308M143 88H105V52H59M216 90H267V48H309M178 151V196M178 77V24"/>
            <rect class="art-chip" x="137" y="76" width="86" height="78" rx="15"/>
            <rect class="art-chip-inner" x="148" y="87" width="64" height="56" rx="8"/>
            <path class="art-leaf" d="M179 131V106M179 118C158 118 156 99 156 99C177 96 183 107 179 118ZM180 109C178 90 197 87 202 87C203 105 190 112 180 109Z"/>
            <g class="art-nodes"><circle cx="51" cy="168" r="4"/><circle cx="308" cy="176" r="4"/><circle cx="59" cy="52" r="4"/><circle cx="309" cy="48" r="4"/><circle cx="178" cy="196" r="4"/><circle cx="178" cy="24" r="4"/></g>
          </svg>
        </div>
        <h2>让知识，在实践中生长。</h2>
        <p>写下理解，也留下问题。<br>每一篇笔记，都是下一次出发的起点。</p>
        <div class="garden-note-bottom"><span>MCU / LINUX / LIFE</span><span class="garden-seal">Z.</span></div>
      </aside>
    </section>

    <section class="home-section" aria-labelledby="topics-title">
      <div class="section-heading"><div><p class="eyebrow">EXPLORE BY TOPIC</p><h2 id="topics-title">沿着兴趣，继续探索</h2></div><span class="section-hint">从一个感兴趣的话题开始</span></div>
      <div class="topic-grid">
        <a v-for="category in categories" :key="category.link" :href="withBase(category.link)" class="topic-card">
          <div class="topic-top"><span class="topic-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><template v-if="slug(category) === 'mcu'"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/><rect x="9" y="9" width="6" height="6" rx="1"/></template><template v-else-if="slug(category) === 'linux'"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></template><template v-else><path d="M12 6C9 4 5 4 2 5v14c3-1 7-1 10 1 3-2 7-2 10-1V5c-3-1-7-1-10 1Zm0 0v14"/></template></svg></span><span>{{ count(slug(category)) }} 篇笔记</span></div>
          <p class="topic-subtitle">{{ descriptions[slug(category)]?.subtitle || 'LEARNING NOTES' }}</p><h3>{{ descriptions[slug(category)]?.name || category.text }}</h3><p>{{ descriptions[slug(category)]?.text || '记录学习与实践中的点滴收获。' }}</p>
        </a>
      </div>
    </section>

    <section class="home-section notes-section" aria-labelledby="notes-title">
      <div class="section-heading"><div><p class="eyebrow">FROM THE NOTEBOOK</p><h2 id="notes-title">翻开几页笔记</h2></div><a class="section-link" :href="withBase('/posts')">查看全部 {{ posts.length }} 篇</a></div>
      <div class="notes-grid"><PostCard v-for="post in featured" :key="post.url" :post="post" /></div>
    </section>
    <div class="home-closing"><span>保持好奇，认真记录。</span><span>Small steps, deeper roots.</span></div>
  </div>
</template>

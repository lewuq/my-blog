import DefaultTheme from 'vitepress/theme'
import { watch, nextTick, onMounted, onUnmounted, h } from 'vue'
import { useRoute } from 'vitepress'
import mediumZoom from 'medium-zoom'
import BlogHome from './components/BlogHome.vue'
import PostArchive from './components/PostArchive.vue'
import DocHeader from './components/DocHeader.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, { 'doc-before': () => h(DocHeader) }),
  enhanceApp({ app }) {
    app.component('BlogHome', BlogHome)
    app.component('PostArchive', PostArchive)
  },
  setup() {
    const route = useRoute()
    let zoom
    const initZoom = () => {
      zoom?.detach()
      zoom = mediumZoom('.vp-doc img:not(.no-zoom)', {
        background: 'var(--blog-zoom-overlay)',
        margin: 24,
      })
    }
    onMounted(initZoom)
    watch(() => route.path, () => nextTick(initZoom))
    onUnmounted(() => zoom?.detach())
  },
}

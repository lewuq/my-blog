import DefaultTheme from 'vitepress/theme'
import { watch, nextTick, onMounted, h } from 'vue'
import { useRoute, useData } from 'vitepress'
import mediumZoom from 'medium-zoom'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    const { page } = useData()
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => {
        const title = page.value.title
        return title ? h('h1', { class: 'doc-title' }, title) : null
      },
    })
  },
  setup() {
    const route = useRoute()
    const initZoom = () => {
      mediumZoom('.vp-doc img:not(.no-zoom)', {
        background: 'rgba(0, 0, 0, 0.75)',
        margin: 16,
      })
    }
    onMounted(initZoom)
    watch(() => route.path, () => nextTick(initZoom))
  },
}
